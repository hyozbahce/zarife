using Microsoft.AspNetCore.Identity;

namespace Zarife.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public Guid? TenantId { get; set; }
    public string? Role { get; set; }
    public string? ProfileJson { get; set; }
}
