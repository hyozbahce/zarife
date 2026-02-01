using System;

namespace Zarife.Core.Entities;

public class User : BaseEntity
{
    public Guid? TenantId { get; set; }
    public School? Tenant { get; set; }

    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // Student, Teacher, Parent, SchoolAdmin, PlatformAdmin
    public string? ProfileJson { get; set; }
}
