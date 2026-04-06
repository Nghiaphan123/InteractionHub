namespace InteractHub.Core.DTOs.Comments;

public class CommentResponseDto
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // User info
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }

    // Reply
    public int? ParentCommentId { get; set; }
    public List<CommentResponseDto> Replies { get; set; } = new();
    public int LikesCount { get; set; }
}