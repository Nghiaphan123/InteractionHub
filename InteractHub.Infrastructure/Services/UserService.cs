using InteractHub.Core.DTOs.Users;
using InteractHub.Core.Interfaces;
using InteractHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using InteractHub.Core.Entities;

namespace InteractHub.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(string userId)
    {
        var user = await _context.Users
            .Include(u => u.Posts)
            .Include(u => u.SentFriendships)
            .Include(u => u.ReceivedFriendships)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        return new UserResponseDto
        {
            Id = user.Id,
            Username = user.UserName!,
            FullName = user.FullName,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            CreatedAt = user.CreatedAt,
            PostsCount = user.Posts.Count,
            FriendsCount = user.SentFriendships.Count(f => f.Status == FriendshipStatus.Accepted) + 
               user.ReceivedFriendships.Count(f => f.Status == FriendshipStatus.Accepted)
        };
    }

    public async Task<UserResponseDto?> UpdateProfileAsync(string userId, UpdateProfileDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.Bio != null) user.Bio = dto.Bio;
        if (dto.AvatarUrl != null) user.AvatarUrl = dto.AvatarUrl;

        await _context.SaveChangesAsync();
        return await GetUserByIdAsync(userId);
    }

    public async Task<List<UserResponseDto>> SearchUsersAsync(string keyword)
    {
        return await _context.Users
            .Where(u => u.UserName!.Contains(keyword) || u.FullName.Contains(keyword))
            .Select(u => new UserResponseDto
            {
                Id = u.Id,
                Username = u.UserName!,
                FullName = u.FullName,
                AvatarUrl = u.AvatarUrl
            })
            .Take(20)
            .ToListAsync();
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(string userId, string? currentUserId = null)
    {
        var user = await _context.Users
            .Include(u => u.Posts)
            .Include(u => u.SentFriendships)
            .Include(u => u.ReceivedFriendships)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        // Tính friendStatus
        string friendStatus = "none";
        if (currentUserId != null && currentUserId != userId)
        {
            var friendship = await _context.Friendships.FirstOrDefaultAsync(f =>
                (f.SenderId == currentUserId && f.ReceiverId == userId) ||
                (f.SenderId == userId && f.ReceiverId == currentUserId));

            if (friendship != null)
            {
                friendStatus = friendship.Status.ToString().ToLower();
                // Nếu mình là sender và pending → "pending"
                if (friendship.Status.ToString() == "Pending" && friendship.SenderId == currentUserId)
                    friendStatus = "pending";
                // Nếu mình là receiver và pending → "received"
                else if (friendship.Status.ToString() == "Pending" && friendship.ReceiverId == currentUserId)
                    friendStatus = "received";
            }
        }

        return new UserResponseDto
        {
            Id = user.Id,
            Username = user.UserName!,
            FullName = user.FullName,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            CreatedAt = user.CreatedAt,
            PostsCount = user.Posts.Count,
           FriendsCount = user.SentFriendships.Count(f => f.Status == FriendshipStatus.Accepted) + 
               user.ReceivedFriendships.Count(f => f.Status == FriendshipStatus.Accepted),
            FriendStatus = friendStatus
        };
    }
}