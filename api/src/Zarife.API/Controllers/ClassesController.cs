using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zarife.Core.DTOs.Classes;
using Zarife.Core.Entities;
using Zarife.Core.Interfaces;
using Zarife.Infrastructure.Data;
using Zarife.Infrastructure.Identity;

namespace Zarife.API.Controllers;

[Authorize(Roles = "PlatformAdmin,SchoolAdmin,Teacher")]
[ApiController]
[Route("api/[controller]")]
public class ClassesController(ApplicationDbContext context, ITenantService tenantService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClassResponse>>> GetClasses()
    {
        var classes = await context.Classes
            .OrderBy(c => c.GradeLevel)
            .ThenBy(c => c.Name)
            .Select(c => new ClassResponse(
                c.Id, c.Name, c.GradeLevel, c.TeacherId, null,
                context.StudentProfiles.Count(sp => sp.ClassId == c.Id),
                c.CreatedAt))
            .ToListAsync();

        return Ok(classes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClassResponse>> GetClass(Guid id)
    {
        var cls = await context.Classes.FirstOrDefaultAsync(c => c.Id == id);
        if (cls == null) return NotFound();

        var studentCount = await context.StudentProfiles.CountAsync(sp => sp.ClassId == id);

        return Ok(new ClassResponse(
            cls.Id, cls.Name, cls.GradeLevel, cls.TeacherId, null,
            studentCount, cls.CreatedAt));
    }

    [HttpPost]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin")]
    public async Task<ActionResult<ClassResponse>> CreateClass(CreateClassRequest request)
    {
        if (!tenantService.TenantId.HasValue)
            return BadRequest("Tenant context is required to create a class.");

        var cls = new Class
        {
            TenantId = tenantService.TenantId.Value,
            Name = request.Name,
            GradeLevel = request.GradeLevel,
            TeacherId = request.TeacherId
        };

        context.Classes.Add(cls);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetClass), new { id = cls.Id }, new ClassResponse(
            cls.Id, cls.Name, cls.GradeLevel, cls.TeacherId, null, 0, cls.CreatedAt));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin")]
    public async Task<ActionResult<ClassResponse>> UpdateClass(Guid id, UpdateClassRequest request)
    {
        var cls = await context.Classes.FindAsync(id);
        if (cls == null) return NotFound();

        cls.Name = request.Name;
        cls.GradeLevel = request.GradeLevel;
        if (request.TeacherId.HasValue)
            cls.TeacherId = request.TeacherId.Value;
        cls.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        var studentCount = await context.StudentProfiles.CountAsync(sp => sp.ClassId == id);

        return Ok(new ClassResponse(
            cls.Id, cls.Name, cls.GradeLevel, cls.TeacherId, null,
            studentCount, cls.CreatedAt));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin")]
    public async Task<IActionResult> DeleteClass(Guid id)
    {
        var cls = await context.Classes.FindAsync(id);
        if (cls == null) return NotFound();

        context.Classes.Remove(cls);
        await context.SaveChangesAsync();

        return NoContent();
    }
}
