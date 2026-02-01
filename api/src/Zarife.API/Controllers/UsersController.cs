using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zarife.Core.DTOs.Users;
using Zarife.Infrastructure.Data;
using Zarife.Infrastructure.Identity;

namespace Zarife.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileResponse>> GetProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var user = await userManager.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

        if (user == null) return NotFound();

        string? tenantName = null;
        if (user.TenantId.HasValue)
        {
            var school = await context.Schools.FindAsync(user.TenantId.Value);
            tenantName = school?.Name;
        }

        return Ok(new UserProfileResponse(
            user.Id, user.Email!, user.Role, user.TenantId, tenantName, user.ProfileJson));
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserProfileResponse>> UpdateProfile(UpdateProfileRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var user = await userManager.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

        if (user == null) return NotFound();

        user.ProfileJson = request.ProfileJson;
        await userManager.UpdateAsync(user);

        return Ok(new UserProfileResponse(
            user.Id, user.Email!, user.Role, user.TenantId, null, user.ProfileJson));
    }

    [HttpGet]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin")]
    public async Task<ActionResult<IEnumerable<UserListResponse>>> GetUsers([FromQuery] string? role)
    {
        var query = userManager.Users.AsQueryable();

        if (!string.IsNullOrEmpty(role))
            query = query.Where(u => u.Role == role);

        var users = await query
            .OrderByDescending(u => u.Id)
            .Select(u => new UserListResponse(
                u.Id, u.Email!, u.Role, u.TenantId, null))
            .ToListAsync();

        return Ok(users);
    }
}
