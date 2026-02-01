using System;

namespace Zarife.Core.DTOs.Management;

public sealed record CreateSchoolRequest(
    string Name,
    string AdminEmail,
    string AdminPassword
);

public sealed record SchoolResponse(
    Guid Id,
    string Name,
    DateTime CreatedAt
);

public sealed record SchoolDetailResponse(
    Guid Id,
    string Name,
    string AdminEmail,
    DateTime CreatedAt
);
