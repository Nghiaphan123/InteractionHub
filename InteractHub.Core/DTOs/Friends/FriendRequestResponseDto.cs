public class FriendRequestResponseDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Username { get; set; } = "";
    public string? AvatarUrl { get; set; }
}