namespace Zarife.Core.DTOs.Books;

public sealed record CreateBookRequest(
    string Title,
    string? Author,
    string? Illustrator,
    string Language,
    int TargetAgeMin,
    int TargetAgeMax,
    int DurationMinutes,
    string? Description,
    string[]? Categories
);

public sealed record UpdateBookRequest(
    string Title,
    string? Author,
    string? Illustrator,
    string Language,
    int TargetAgeMin,
    int TargetAgeMax,
    int DurationMinutes,
    string? Description,
    string? Status,
    string[]? Categories
);

public sealed record BookResponse(
    Guid Id,
    string Title,
    string? Author,
    string? Illustrator,
    string Language,
    int TargetAgeMin,
    int TargetAgeMax,
    int DurationMinutes,
    string? CoverImageUrl,
    string? Description,
    string Status,
    string[]? Categories,
    int PageCount,
    DateTime CreatedAt
);

public sealed record BookDetailResponse(
    Guid Id,
    string Title,
    string? Author,
    string? Illustrator,
    string Language,
    int TargetAgeMin,
    int TargetAgeMax,
    int DurationMinutes,
    string? CoverImageUrl,
    string? Description,
    string Status,
    string[]? Categories,
    int PageCount,
    DateTime CreatedAt,
    IEnumerable<BookPageResponse> Pages
);

public sealed record BookPageResponse(
    Guid Id,
    int PageNumber,
    string? RiveFileUrl,
    string? StateMachine,
    string? Artboard,
    string? NarrationAudioUrl,
    string? NarrationText
);

public sealed record CreateBookPageRequest(
    int PageNumber,
    string? RiveFileUrl,
    string? StateMachine,
    string? Artboard,
    string? NarrationText
);

public sealed record UpdateBookPageRequest(
    int PageNumber,
    string? RiveFileUrl,
    string? StateMachine,
    string? Artboard,
    string? NarrationAudioUrl,
    string? NarrationText,
    string? WordTimingsJson,
    string? InputsJson,
    string? TriggersJson
);
