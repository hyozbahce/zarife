namespace Zarife.Core.Entities;

public class Book : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Author { get; set; }
    public string? Illustrator { get; set; }
    public string Language { get; set; } = "tr";
    public int TargetAgeMin { get; set; } = 3;
    public int TargetAgeMax { get; set; } = 6;
    public int DurationMinutes { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = "Draft"; // Draft, Review, Published
    public string? CategoriesJson { get; set; } // JSON array of categories
    public int PageCount { get; set; }

    public ICollection<BookPage> Pages { get; set; } = new List<BookPage>();
    public ICollection<BookAssignment> Assignments { get; set; } = new List<BookAssignment>();
}
