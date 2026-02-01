using System.Security.Claims;
using Zarife.Core.Interfaces;

namespace Zarife.API.Middleware;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantService tenantService)
    {
        // 1. Check for Tenant ID in JWT claims (Preferred for authenticated requests)
        var tenantIdClaim = context.User.FindFirst("tenant_id")?.Value;

        // 2. Fallback to Custom Header (Useful for login/registration or public stats)
        if (string.IsNullOrEmpty(tenantIdClaim))
        {
            tenantIdClaim = context.Request.Headers["X-Tenant-ID"].ToString();
        }

        if (!string.IsNullOrEmpty(tenantIdClaim) && Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            tenantService.SetTenant(tenantId);
        }

        await _next(context);
    }
}
