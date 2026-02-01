using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zarife.Core.DTOs.Account;
using Zarife.Infrastructure.Identity;
using Zarife.Infrastructure.Security;

namespace Zarife.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AccountController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    ITokenService tokenService,
    ILogger<AccountController> logger) : ControllerBase
{
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            logger.LogWarning("Login failed for email: {Email} - User not found", request.Email);
            return Unauthorized("Invalid email or password");
        }

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
        {
            logger.LogWarning("Login failed for email: {Email} - Invalid password", request.Email);
            return Unauthorized("Invalid email or password");
        }

        logger.LogInformation("User {Email} logged in successfully", request.Email);
        
        return Ok(new AuthResponse(
            user.Email!,
            tokenService.CreateToken(user),
            user.Role ?? "user",
            user.TenantId
        ));
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (await userManager.Users.AnyAsync(x => x.Email == request.Email))
        {
            return BadRequest("Email is already in use");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            Role = request.Role,
            TenantId = request.TenantId
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        logger.LogInformation("New user registered: {Email}", request.Email);

        return Ok(new AuthResponse(
            user.Email!,
            tokenService.CreateToken(user),
            user.Role ?? "user",
            user.TenantId
        ));
    }
}
