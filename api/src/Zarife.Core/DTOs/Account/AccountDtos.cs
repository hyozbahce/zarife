using System;

namespace Zarife.Core.DTOs.Account;

public sealed record LoginRequest(string Email, string Password);

public sealed record RegisterRequest(
    string Email, 
    string Password, 
    string Role, 
    Guid? TenantId);

public sealed record AuthResponse(
    string Email, 
    string Token, 
    string Role, 
    Guid? TenantId);
