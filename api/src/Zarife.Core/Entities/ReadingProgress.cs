namespace Zarife.Core.Entities;

public class ReadingProgress : BaseEntity
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid BookId { get; set; }
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int ReadingTimeSeconds { get; set; }
    public int InteractionCount { get; set; }

    public Book? Book { get; set; }
}
