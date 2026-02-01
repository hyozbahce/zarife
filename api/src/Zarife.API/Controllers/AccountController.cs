using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zarife.Infrastructure.Identity;
using Zarife.Infrastructure.Security;

namespace Zarife.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;

    public AccountController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);
        if (user == null) return Unauthorized("Invalid email or password");

        var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
        if (!result.Succeeded) return Unauthorized("Invalid email or password");

        return new UserDto
        {
            Email = user.Email!,
            Token = _tokenService.CreateToken(user),
            Role = user.Role ?? "user",
            TenantId = user.TenantId
        };
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        if (await _userManager.Users.AnyAsync(x => x.Email == registerDto.Email))
        {
            return BadRequest("Email is taken");
        }

        var user = new ApplicationUser
        {
            UserName = registerDto.Email,
            Email = registerDto.Email,
            Role = registerDto.Role,
            TenantId = registerDto.TenantId
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return new UserDto
        {
            Email = user.Email,
            Token = _tokenService.CreateToken(user),
            Role = user.Role,
            TenantId = user.TenantId
        };
    }
}

public record LoginDto(string Email, string Password);
public record RegisterDto(string Email, string Password, string Role, Guid? TenantId);
public record UserDto { public string Email { get; set; } = string.Empty; public string Token { get; set; } = string.Empty; public string Role { get; set; } = string.Empty; public Guid? TenantId { get; set; } }
