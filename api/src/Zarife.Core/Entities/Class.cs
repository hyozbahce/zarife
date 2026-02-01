namespace Zarife.Core.Entities;

public class Class : BaseEntity
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int GradeLevel { get; set; }
    public Guid TeacherId { get; set; }

    public School? School { get; set; }
}
