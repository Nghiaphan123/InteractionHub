namespace InteractHub.Core.DTOs.Notifications;

public class NotificationResponseDto
{
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public int? ReferenceId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string SenderUsername { get; set; } = string.Empty;
    public string? SenderAvatarUrl { get; set; }
}

public enum NotificationTypeDto
{
    Like,
    Comment,
    FriendRequest,
    FriendAccepted,
    Share,
    Mention
}