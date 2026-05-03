using InteractHub.Core.DTOs;
using InteractHub.Core.DTOs.Auth;
using InteractHub.Core.Entities;
using InteractHub.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly JwtService _jwtService;
    private static readonly Dictionary<string, string> _resetCodes = new();

    public AuthController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        RoleManager<IdentityRole> roleManager,
        JwtService jwtService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
        _jwtService = jwtService;
    }

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        // Kiểm tra email đã tồn tại chưa
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            return BadRequest(new { message = "Email đã được sử dụng" });

        // Kiểm tra username đã tồn tại chưa
        var existingUsername = await _userManager.FindByNameAsync(dto.Username);
        if (existingUsername != null)
            return BadRequest(new { message = "Username đã được sử dụng" });

        // Tạo user mới
        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            FullName = dto.FullName,
            CreatedAt = DateTime.UtcNow
        };

        // Identity tự hash password
        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        // Gán role mặc định là "User"
        if (!await _roleManager.RoleExistsAsync("User"))
            await _roleManager.CreateAsync(new IdentityRole("User"));

        await _userManager.AddToRoleAsync(user, "User");

        // Tạo JWT token
        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtService.GenerateToken(user, roles);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Username = user.UserName!,
            Email = user.Email!,
            FullName = user.FullName,
            Roles = roles,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // Tìm user theo email
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });

        // Kiểm tra password
        var result = await _signInManager.CheckPasswordSignInAsync(
            user, dto.Password, lockoutOnFailure: false);

        if (!result.Succeeded)
            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });

        // Tạo JWT token
        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtService.GenerateToken(user, roles);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Username = user.UserName!,
            Email = user.Email!,
            FullName = user.FullName,
            Roles = roles,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });
    }

    // GET /api/auth/me - lấy thông tin user hiện tại
    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> GetMe()
    {
        var user = await _userManager.FindByNameAsync(User.Identity!.Name!);
        if (user == null)
            return NotFound();

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new AuthResponseDto
        {
            Username = user.UserName!,
            Email = user.Email!,
            FullName = user.FullName,
            Roles = roles
        });
    }

    // ADD API SEND CODE
    [HttpPost("send-reset-code")]
    public async Task<IActionResult> SendResetCode([FromBody] SendCodeDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return BadRequest(new { message = "Email không tồn tại" });

        // FIXED OTP
        _resetCodes[dto.Email] = "123456";

        return Ok(new { message = "OK" });
    }

    // FIND ACCOUNT
    [HttpPost("find-account")]
    public async Task<IActionResult> FindAccount([FromBody] SendCodeDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return NotFound(new { message = "Không tìm thấy tài khoản" });

        return Ok(new
        {
            fullName = user.FullName,
            avatarUrl = user.AvatarUrl,
            emails = new[] { user.Email },
            phones = new string[] { }
        });
    }

    // VERIFY CODE
    [HttpPost("verify-reset-code")]
    public IActionResult VerifyResetCode([FromBody] VerifyCodeDto dto)
    {
        if (!_resetCodes.ContainsKey(dto.Email))
            return BadRequest(new { message = "INVALID" });

        if (_resetCodes[dto.Email] != dto.Code)
            return BadRequest(new { message = "INVALID" });

        return Ok(new { message = "OK" });
    }

    // RESET PASSWORD
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        if (!_resetCodes.ContainsKey(dto.Email))
            return BadRequest(new { message = "INVALID" });

        if (_resetCodes[dto.Email] != dto.Code)
            return BadRequest(new { message = "INVALID" });

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return BadRequest(new { message = "Email không tồn tại" });

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);

        var result = await _userManager.ResetPasswordAsync(
            user,
            token,
            dto.NewPassword
        );

        if (!result.Succeeded)
            return BadRequest(new { message = "FAIL" });

        _resetCodes.Remove(dto.Email);

        return Ok(new { message = "OK" });
    }
}