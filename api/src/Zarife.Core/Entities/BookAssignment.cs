namespace Zarife.Core.Entities;

public class BookAssignment : BaseEntity
{
    public Guid TenantId { get; set; }
    public Guid BookId { get; set; }
    public Guid? ClassId { get; set; }
    public Guid? StudentUserId { get; set; }
    public Guid AssignedByUserId { get; set; }
    public DateTime? DueDate { get; set; }

    public Book? Book { get; set; }
    public Class? Class { get; set; }
}
