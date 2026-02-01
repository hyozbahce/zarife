namespace Zarife.Core.DTOs.Progress;

public sealed record UpdateProgressRequest(
    Guid BookId,
    int CurrentPage,
    int TotalPages,
    int ReadingTimeSeconds,
    int InteractionCount,
    bool IsCompleted
);

public sealed record ProgressResponse(
    Guid Id,
    Guid BookId,
    string? BookTitle,
    int CurrentPage,
    int TotalPages,
    bool IsCompleted,
    DateTime? CompletedAt,
    int ReadingTimeSeconds,
    int InteractionCount,
    DateTime CreatedAt
);

public sealed record AnalyticsResponse(
    int TotalBooksRead,
    int TotalBooksInProgress,
    int TotalReadingTimeSeconds,
    int TotalInteractions,
    double CompletionRate,
    IEnumerable<ProgressResponse> RecentActivity
);
