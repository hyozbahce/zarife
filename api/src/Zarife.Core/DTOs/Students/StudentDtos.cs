namespace Zarife.Core.DTOs.Students;

public sealed record CreateStudentRequest(
    string Email,
    string Password,
    string DisplayName,
    Guid? ClassId,
    Guid? ParentUserId
);

public sealed record StudentResponse(
    Guid Id,
    Guid UserId,
    string DisplayName,
    string? AvatarUrl,
    Guid? ClassId,
    string? ClassName,
    int TotalBooksRead,
    int TotalReadingTimeSeconds,
    int CurrentStreak,
    DateTime CreatedAt
);

public sealed record StudentLoginRequest(
    string SchoolCode,
    string Username
);

public sealed record UpdateStudentRequest(
    string DisplayName,
    Guid? ClassId
);
