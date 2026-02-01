using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zarife.Core.DTOs.Management;
using Zarife.Core.Entities;
using Zarife.Infrastructure.Data;
using Zarife.Infrastructure.Identity;

namespace Zarife.API.Controllers;

[Authorize(Roles = "PlatformAdmin")]
[ApiController]
[Route("api/[controller]")]
public class ManagementController(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager,
    ILogger<ManagementController> logger) : ControllerBase
{
    [HttpGet("schools")]
    public async Task<ActionResult<IEnumerable<SchoolResponse>>> GetSchools()
    {
        var schools = await context.Schools
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new SchoolResponse(s.Id, s.Name, s.CreatedAt))
            .ToListAsync();

        return Ok(schools);
    }

    [HttpPost("schools")]
    public async Task<ActionResult<SchoolResponse>> CreateSchool(CreateSchoolRequest request)
    {
        // 1. Check if admin email already exists
        if (await userManager.FindByEmailAsync(request.AdminEmail) != null)
        {
            return BadRequest("Admin email is already in use.");
        }

        using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            // 2. Create School
            var school = new School
            {
                Name = request.Name,
                Subdomain = request.Name.ToLower().Replace(" ", "-"), // Simplified subdomain generation
                CreatedAt = DateTime.UtcNow
            };

            context.Schools.Add(school);
            await context.SaveChangesAsync();

            // 3. Create School Admin
            var adminUser = new ApplicationUser
            {
                UserName = request.AdminEmail,
                Email = request.AdminEmail,
                EmailConfirmed = true,
                Role = "SchoolAdmin",
                TenantId = school.Id
            };

            var result = await userManager.CreateAsync(adminUser, request.AdminPassword);
            if (!result.Succeeded)
            {
                await transaction.RollbackAsync();
                return BadRequest(result.Errors);
            }

            await userManager.AddToRoleAsync(adminUser, "SchoolAdmin");

            await transaction.CommitAsync();

            logger.LogInformation("School '{SchoolName}' created with admin '{AdminEmail}'", school.Name, adminUser.Email);

            return CreatedAtAction(nameof(GetSchools), new SchoolResponse(school.Id, school.Name, school.CreatedAt));
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            logger.LogError(ex, "Failed to create school");
            return StatusCode(500, "An error occurred while creating the school.");
        }
    }

    [HttpDelete("schools/{id}")]
    public async Task<IActionResult> DeleteSchool(Guid id)
    {
        var school = await context.Schools.FindAsync(id);
        if (school == null) return NotFound();

        // Warning: This should probably also delete or deactivate users
        context.Schools.Remove(school);
        await context.SaveChangesAsync();

        return NoContent();
    }
}
