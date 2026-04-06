using InteractHub.Core.DTOs.Notifications;

namespace InteractHub.Core.Interfaces;

public interface INotificationService
{
    Task<List<NotificationResponseDto>> GetNotificationsAsync(string userId);
    Task<bool> MarkAsReadAsync(int notificationId, string userId);
    Task<bool> MarkAllAsReadAsync(string userId);
    Task CreateNotificationAsync(string userId, string senderId, string message, NotificationTypeDto type, int? referenceId = null);
}