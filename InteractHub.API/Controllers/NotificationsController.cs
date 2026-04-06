using InteractHub.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    private string GetCurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    // GET /api/notifications
    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var notifications = await _notificationService
            .GetNotificationsAsync(GetCurrentUserId());
        return Ok(notifications);
    }

    // PUT /api/notifications/5/read
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var result = await _notificationService.MarkAsReadAsync(id, GetCurrentUserId());
        if (!result)
            return NotFound(new { message = "Không tìm thấy thông báo" });

        return Ok(new { message = "Đã đánh dấu đã đọc" });
    }

    // PUT /api/notifications/read-all
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _notificationService.MarkAllAsReadAsync(GetCurrentUserId());
        return Ok(new { message = "Đã đánh dấu tất cả đã đọc" });
    }
}