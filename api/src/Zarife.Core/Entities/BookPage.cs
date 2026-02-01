namespace Zarife.Core.Entities;

public class BookPage : BaseEntity
{
    public Guid BookId { get; set; }
    public int PageNumber { get; set; }
    public string? RiveFileUrl { get; set; }
    public string? StateMachine { get; set; }
    public string? Artboard { get; set; }
    public string? NarrationAudioUrl { get; set; }
    public string? NarrationText { get; set; }
    public string? WordTimingsJson { get; set; } // JSON for word timing sync
    public string? InputsJson { get; set; } // Rive state machine inputs
    public string? TriggersJson { get; set; } // Rive state machine triggers

    public Book? Book { get; set; }
}
