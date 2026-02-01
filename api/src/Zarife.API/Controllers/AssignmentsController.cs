using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zarife.Core.Entities;
using Zarife.Core.Interfaces;
using Zarife.Infrastructure.Data;

namespace Zarife.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AssignmentsController(ApplicationDbContext context, ITenantService tenantService) : ControllerBase
{
    public sealed record CreateAssignmentRequest(Guid BookId, Guid? ClassId, Guid? StudentUserId, DateTime? DueDate);
    public sealed record AssignmentResponse(Guid Id, Guid BookId, string? BookTitle, Guid? ClassId, string? ClassName, Guid? StudentUserId, Guid AssignedByUserId, DateTime? DueDate, DateTime CreatedAt);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AssignmentResponse>>> GetAssignments([FromQuery] Guid? classId)
    {
        var query = context.BookAssignments
            .Include(ba => ba.Book)
            .Include(ba => ba.Class)
            .AsQueryable();

        if (classId.HasValue)
            query = query.Where(ba => ba.ClassId == classId.Value);

        var assignments = await query
            .OrderByDescending(ba => ba.CreatedAt)
            .Select(ba => new AssignmentResponse(
                ba.Id, ba.BookId, ba.Book != null ? ba.Book.Title : null,
                ba.ClassId, ba.Class != null ? ba.Class.Name : null,
                ba.StudentUserId, ba.AssignedByUserId, ba.DueDate, ba.CreatedAt))
            .ToListAsync();

        return Ok(assignments);
    }

    [HttpPost]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin,Teacher")]
    public async Task<ActionResult<AssignmentResponse>> CreateAssignment(CreateAssignmentRequest request)
    {
        if (!tenantService.TenantId.HasValue)
            return BadRequest("Tenant context required.");

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var assignment = new BookAssignment
        {
            TenantId = tenantService.TenantId.Value,
            BookId = request.BookId,
            ClassId = request.ClassId,
            StudentUserId = request.StudentUserId,
            AssignedByUserId = Guid.Parse(userId),
            DueDate = request.DueDate
        };

        context.BookAssignments.Add(assignment);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAssignments), new AssignmentResponse(
            assignment.Id, assignment.BookId, null,
            assignment.ClassId, null, assignment.StudentUserId,
            assignment.AssignedByUserId, assignment.DueDate, assignment.CreatedAt));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin,Teacher")]
    public async Task<IActionResult> DeleteAssignment(Guid id)
    {
        var assignment = await context.BookAssignments.FindAsync(id);
        if (assignment == null) return NotFound();

        context.BookAssignments.Remove(assignment);
        await context.SaveChangesAsync();

        return NoContent();
    }
}
