namespace InteractHub.Core.DTOs.Users;

public class UserResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public int PostsCount { get; set; }
    public int FriendsCount { get; set; }
}
