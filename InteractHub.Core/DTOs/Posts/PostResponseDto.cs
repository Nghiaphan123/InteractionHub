namespace InteractHub.Core.DTOs.Posts;

public class PostResponseDto
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }

    // User info
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }

    // Counts
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
    public bool IsLikedByCurrentUser { get; set; }
}