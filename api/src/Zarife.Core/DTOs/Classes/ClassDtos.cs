namespace Zarife.Core.DTOs.Classes;

public sealed record CreateClassRequest(
    string Name,
    int GradeLevel,
    Guid TeacherId
);

public sealed record UpdateClassRequest(
    string Name,
    int GradeLevel,
    Guid? TeacherId
);

public sealed record ClassResponse(
    Guid Id,
    string Name,
    int GradeLevel,
    Guid TeacherId,
    string? TeacherName,
    int StudentCount,
    DateTime CreatedAt
);
