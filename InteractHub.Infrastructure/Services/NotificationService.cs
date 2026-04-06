using InteractHub.Core.DTOs.Notifications;
using InteractHub.Core.Entities;
using InteractHub.Core.Interfaces;
using InteractHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;

    public NotificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<NotificationResponseDto>> GetNotificationsAsync(string userId)
    {
        return await _context.Notifications
            .Include(n => n.Sender)
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationResponseDto
            {
                Id = n.Id,
                Message = n.Message,
                Type = n.Type.ToString(),
                IsRead = n.IsRead,
                ReferenceId = n.ReferenceId,
                CreatedAt = n.CreatedAt,
                SenderId = n.SenderId,
                SenderUsername = n.Sender.UserName!,
                SenderAvatarUrl = n.Sender.AvatarUrl
            })
            .ToListAsync();
    }

    public async Task<bool> MarkAsReadAsync(int notificationId, string userId)
    {
        var notification = await _context.Notifications.FirstOrDefaultAsync(
            n => n.Id == notificationId && n.UserId == userId);

        if (notification == null) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(string userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        notifications.ForEach(n => n.IsRead = true);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task CreateNotificationAsync(
        string userId, string senderId, string message,
        NotificationTypeDto type, int? referenceId = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            SenderId = senderId,
            Message = message,
            Type = (NotificationType)type,
            ReferenceId = referenceId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
    }
}