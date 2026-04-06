using InteractHub.Core.DTOs.Users;
using InteractHub.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    private string GetCurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    // GET /api/users/me
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var user = await _userService.GetUserByIdAsync(GetCurrentUserId());
        if (user == null) return NotFound();
        return Ok(user);
    }

    // GET /api/users/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null) return NotFound(new { message = "Không tìm thấy user" });
        return Ok(user);
    }

    // PUT /api/users/me
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var user = await _userService.UpdateProfileAsync(GetCurrentUserId(), dto);
        if (user == null) return NotFound();
        return Ok(user);
    }

    // GET /api/users/search?keyword=abc
    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string keyword)
    {
        if (string.IsNullOrEmpty(keyword))
            return BadRequest(new { message = "Keyword không được để trống" });

        var users = await _userService.SearchUsersAsync(keyword);
        return Ok(users);
    }
}