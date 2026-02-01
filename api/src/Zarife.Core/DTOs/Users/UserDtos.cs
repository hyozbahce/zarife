namespace Zarife.Core.DTOs.Users;

public sealed record UserProfileResponse(
    Guid Id,
    string Email,
    string? Role,
    Guid? TenantId,
    string? TenantName,
    string? ProfileJson
);

public sealed record UpdateProfileRequest(
    string? ProfileJson
);

public sealed record UserListResponse(
    Guid Id,
    string Email,
    string? Role,
    Guid? TenantId,
    DateTime? CreatedAt
);
