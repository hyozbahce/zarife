using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zarife.Core.DTOs.Students;
using Zarife.Core.Entities;
using Zarife.Core.Interfaces;
using Zarife.Infrastructure.Data;
using Zarife.Infrastructure.Identity;
using Zarife.Infrastructure.Security;

namespace Zarife.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StudentsController(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager,
    ITenantService tenantService,
    ITokenService tokenService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin,Teacher")]
    public async Task<ActionResult<IEnumerable<StudentResponse>>> GetStudents([FromQuery] Guid? classId)
    {
        var query = context.StudentProfiles.AsQueryable();

        if (classId.HasValue)
            query = query.Where(sp => sp.ClassId == classId.Value);

        var students = await query
            .OrderBy(sp => sp.DisplayName)
            .Select(sp => new StudentResponse(
                sp.Id, sp.UserId, sp.DisplayName, sp.AvatarUrl,
                sp.ClassId, sp.Class != null ? sp.Class.Name : null,
                sp.TotalBooksRead, sp.TotalReadingTimeSeconds, sp.CurrentStreak,
                sp.CreatedAt))
            .ToListAsync();

        return Ok(students);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StudentResponse>> GetStudent(Guid id)
    {
        var student = await context.StudentProfiles
            .Include(sp => sp.Class)
            .FirstOrDefaultAsync(sp => sp.Id == id);

        if (student == null) return NotFound();

        return Ok(new StudentResponse(
            student.Id, student.UserId, student.DisplayName, student.AvatarUrl,
            student.ClassId, student.Class?.Name,
            student.TotalBooksRead, student.TotalReadingTimeSeconds, student.CurrentStreak,
            student.CreatedAt));
    }

    [HttpPost]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin,Teacher")]
    public async Task<ActionResult<StudentResponse>> CreateStudent(CreateStudentRequest request)
    {
        if (!tenantService.TenantId.HasValue)
            return BadRequest("Tenant context is required.");

        if (await userManager.FindByEmailAsync(request.Email) != null)
            return BadRequest("Email is already in use.");

        using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                EmailConfirmed = true,
                Role = "Student",
                TenantId = tenantService.TenantId.Value
            };

            var result = await userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                await transaction.RollbackAsync();
                return BadRequest(result.Errors);
            }

            await userManager.AddToRoleAsync(user, "Student");

            // Generate school code
            var school = await context.Schools.FindAsync(tenantService.TenantId.Value);
            var schoolCode = school?.Subdomain?.ToUpper().Replace("-", "")[..Math.Min(6, school.Subdomain.Replace("-", "").Length)]
                           ?? tenantService.TenantId.Value.ToString()[..6].ToUpper();

            var profile = new StudentProfile
            {
                TenantId = tenantService.TenantId.Value,
                UserId = user.Id,
                DisplayName = request.DisplayName,
                ClassId = request.ClassId,
                ParentUserId = request.ParentUserId,
                SchoolCode = schoolCode
            };

            context.StudentProfiles.Add(profile);
            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetStudent), new { id = profile.Id }, new StudentResponse(
                profile.Id, profile.UserId, profile.DisplayName, profile.AvatarUrl,
                profile.ClassId, null, 0, 0, 0, profile.CreatedAt));
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult> StudentLogin(StudentLoginRequest request)
    {
        // Find student by school code and username
        var profile = await context.StudentProfiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(sp => sp.SchoolCode == request.SchoolCode.ToUpper());

        if (profile == null)
            return Unauthorized("Invalid school code or username.");

        var user = await userManager.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == profile.UserId);

        if (user == null || !user.UserName!.StartsWith(request.Username, StringComparison.OrdinalIgnoreCase))
            return Unauthorized("Invalid school code or username.");

        return Ok(new
        {
            email = user.Email,
            token = tokenService.CreateToken(user),
            role = user.Role ?? "Student",
            tenantId = user.TenantId
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin,Teacher")]
    public async Task<ActionResult<StudentResponse>> UpdateStudent(Guid id, UpdateStudentRequest request)
    {
        var profile = await context.StudentProfiles
            .Include(sp => sp.Class)
            .FirstOrDefaultAsync(sp => sp.Id == id);

        if (profile == null) return NotFound();

        profile.DisplayName = request.DisplayName;
        profile.ClassId = request.ClassId;
        profile.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return Ok(new StudentResponse(
            profile.Id, profile.UserId, profile.DisplayName, profile.AvatarUrl,
            profile.ClassId, profile.Class?.Name,
            profile.TotalBooksRead, profile.TotalReadingTimeSeconds, profile.CurrentStreak,
            profile.CreatedAt));
    }
}
