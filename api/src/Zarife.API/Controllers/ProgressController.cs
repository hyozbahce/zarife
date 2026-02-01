using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zarife.Core.DTOs.Progress;
using Zarife.Core.Entities;
using Zarife.Core.Interfaces;
using Zarife.Infrastructure.Data;

namespace Zarife.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProgressController(ApplicationDbContext context, ITenantService tenantService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProgressResponse>>> GetMyProgress()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var progress = await context.ReadingProgress
            .Where(rp => rp.UserId == userId.Value)
            .OrderByDescending(rp => rp.UpdatedAt ?? rp.CreatedAt)
            .Select(rp => new ProgressResponse(
                rp.Id, rp.BookId, rp.Book != null ? rp.Book.Title : null,
                rp.CurrentPage, rp.TotalPages, rp.IsCompleted, rp.CompletedAt,
                rp.ReadingTimeSeconds, rp.InteractionCount, rp.CreatedAt))
            .ToListAsync();

        return Ok(progress);
    }

    [HttpPost]
    public async Task<ActionResult<ProgressResponse>> UpdateProgress(UpdateProgressRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var existing = await context.ReadingProgress
            .FirstOrDefaultAsync(rp => rp.UserId == userId.Value && rp.BookId == request.BookId);

        if (existing == null)
        {
            existing = new ReadingProgress
            {
                TenantId = tenantService.TenantId ?? Guid.Empty,
                UserId = userId.Value,
                BookId = request.BookId,
                CurrentPage = request.CurrentPage,
                TotalPages = request.TotalPages,
                ReadingTimeSeconds = request.ReadingTimeSeconds,
                InteractionCount = request.InteractionCount,
                IsCompleted = request.IsCompleted,
                CompletedAt = request.IsCompleted ? DateTime.UtcNow : null
            };
            context.ReadingProgress.Add(existing);
        }
        else
        {
            existing.CurrentPage = request.CurrentPage;
            existing.TotalPages = request.TotalPages;
            existing.ReadingTimeSeconds += request.ReadingTimeSeconds;
            existing.InteractionCount += request.InteractionCount;
            if (request.IsCompleted && !existing.IsCompleted)
            {
                existing.IsCompleted = true;
                existing.CompletedAt = DateTime.UtcNow;
            }
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await context.SaveChangesAsync();

        // Update student profile stats
        var profile = await context.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == userId.Value);
        if (profile != null)
        {
            profile.TotalBooksRead = await context.ReadingProgress.CountAsync(rp => rp.UserId == userId.Value && rp.IsCompleted);
            profile.TotalReadingTimeSeconds = await context.ReadingProgress
                .Where(rp => rp.UserId == userId.Value)
                .SumAsync(rp => rp.ReadingTimeSeconds);
            await context.SaveChangesAsync();
        }

        return Ok(new ProgressResponse(
            existing.Id, existing.BookId, null,
            existing.CurrentPage, existing.TotalPages, existing.IsCompleted,
            existing.CompletedAt, existing.ReadingTimeSeconds, existing.InteractionCount,
            existing.CreatedAt));
    }

    [HttpGet("analytics")]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin,Teacher")]
    public async Task<ActionResult<AnalyticsResponse>> GetAnalytics([FromQuery] Guid? studentId)
    {
        var query = context.ReadingProgress.AsQueryable();

        if (studentId.HasValue)
            query = query.Where(rp => rp.UserId == studentId.Value);

        var totalCompleted = await query.CountAsync(rp => rp.IsCompleted);
        var totalInProgress = await query.CountAsync(rp => !rp.IsCompleted);
        var totalTime = await query.SumAsync(rp => rp.ReadingTimeSeconds);
        var totalInteractions = await query.SumAsync(rp => rp.InteractionCount);
        var totalRecords = await query.CountAsync();
        var completionRate = totalRecords > 0 ? (double)totalCompleted / totalRecords * 100 : 0;

        var recentActivity = await query
            .OrderByDescending(rp => rp.UpdatedAt ?? rp.CreatedAt)
            .Take(10)
            .Select(rp => new ProgressResponse(
                rp.Id, rp.BookId, rp.Book != null ? rp.Book.Title : null,
                rp.CurrentPage, rp.TotalPages, rp.IsCompleted, rp.CompletedAt,
                rp.ReadingTimeSeconds, rp.InteractionCount, rp.CreatedAt))
            .ToListAsync();

        return Ok(new AnalyticsResponse(
            totalCompleted, totalInProgress, totalTime, totalInteractions,
            completionRate, recentActivity));
    }

    private Guid? GetUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return sub != null ? Guid.Parse(sub) : null;
    }
}
