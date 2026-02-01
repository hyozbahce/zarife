namespace Zarife.Core.Entities;

public class StudentProfile : BaseEntity
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public Guid? ClassId { get; set; }
    public Guid? ParentUserId { get; set; }
    public string? SchoolCode { get; set; } // For simplified student login
    public int TotalBooksRead { get; set; }
    public int TotalReadingTimeSeconds { get; set; }
    public int CurrentStreak { get; set; }

    public Class? Class { get; set; }
}
