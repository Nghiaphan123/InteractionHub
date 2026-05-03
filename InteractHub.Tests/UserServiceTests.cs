using InteractHub.Core.DTOs.Users;
using InteractHub.Core.Entities;
using InteractHub.Infrastructure.Data;
using InteractHub.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace InteractHub.Tests;

public class UserServiceTests
{
    private AppDbContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new AppDbContext(options);
    }

    private User CreateUser(string id, string username) => new User
    {
        Id = id,
        UserName = username,
        FullName = $"Full {username}",
        Email = $"{username}@test.com",
        Bio = "Test bio"
    };

    // ✅ Test 1: GetUserByIdAsync tìm thấy user
    [Fact]
    public async Task GetUserByIdAsync_ExistingUser_ReturnsUser()
    {
        var ctx = CreateInMemoryContext("GetUser_Found");
        ctx.Users.Add(CreateUser("u1", "user1"));
        await ctx.SaveChangesAsync();

        var service = new UserService(ctx);
        var result = await service.GetUserByIdAsync("u1");

        Assert.NotNull(result);
        Assert.Equal("u1", result.Id);
        Assert.Equal("user1", result.Username);
    }

    // ✅ Test 2: GetUserByIdAsync không tìm thấy user
    [Fact]
    public async Task GetUserByIdAsync_NotFound_ReturnsNull()
    {
        var ctx = CreateInMemoryContext("GetUser_NotFound");
        var service = new UserService(ctx);

        var result = await service.GetUserByIdAsync("u999");

        Assert.Null(result);
    }

    // ✅ Test 3: GetUserByIdAsync trả về đúng PostsCount
    [Fact]
    public async Task GetUserByIdAsync_ReturnsCorrectPostsCount()
    {
        var ctx = CreateInMemoryContext("GetUser_PostsCount");
        var user = CreateUser("u1", "user1");
        ctx.Users.Add(user);
        ctx.Posts.AddRange(
            new Post { Content = "Post 1", UserId = "u1", CreatedAt = DateTime.UtcNow },
            new Post { Content = "Post 2", UserId = "u1", CreatedAt = DateTime.UtcNow }
        );
        await ctx.SaveChangesAsync();

        var service = new UserService(ctx);
        var result = await service.GetUserByIdAsync("u1");

        Assert.Equal(2, result!.PostsCount);
    }

    // ✅ Test 4: GetUserByIdAsync trả về đúng FriendsCount (chỉ Accepted)
    [Fact]
    public async Task GetUserByIdAsync_ReturnsCorrectFriendsCount()
    {
        var ctx = CreateInMemoryContext("GetUser_FriendsCount");
        ctx.Users.AddRange(CreateUser("u1", "user1"), CreateUser("u2", "user2"), CreateUser("u3", "user3"));
        ctx.Friendships.AddRange(
            new Friendship { SenderId = "u1", ReceiverId = "u2", Status = FriendshipStatus.Accepted },
            new Friendship { SenderId = "u3", ReceiverId = "u1", Status = FriendshipStatus.Pending }
        );
        await ctx.SaveChangesAsync();

        var service = new UserService(ctx);
        var result = await service.GetUserByIdAsync("u1");

        Assert.Equal(1, result!.FriendsCount); // chỉ tính Accepted
    }

    // ✅ Test 5: UpdateProfileAsync cập nhật FullName
    [Fact]
    public async Task UpdateProfileAsync_UpdateFullName_ReturnsUpdated()
    {
        var ctx = CreateInMemoryContext("Update_FullName");
        ctx.Users.Add(CreateUser("u1", "user1"));
        await ctx.SaveChangesAsync();

        var service = new UserService(ctx);
        var result = await service.UpdateProfileAsync("u1", new UpdateProfileDto { FullName = "New Name" });

        Assert.NotNull(result);
        Assert.Equal("New Name", result.FullName);
    }

    // ✅ Test 6: UpdateProfileAsync cập nhật Bio
    [Fact]
    public async Task UpdateProfileAsync_UpdateBio_ReturnsUpdated()
    {
        var ctx = CreateInMemoryContext("Update_Bio");
        ctx.Users.Add(CreateUser("u1", "user1"));
        await ctx.SaveChangesAsync();

        var service = new UserService(ctx);
        var result = await service.UpdateProfileAsync("u1", new UpdateProfileDto { Bio = "New bio" });

        Assert.Equal("New bio", result!.Bio);
    }

    // ✅ Test 7: UpdateProfileAsync user không tồn tại
    [Fact]
    public async Task UpdateProfileAsync_NotFound_ReturnsNull()
    {
        var ctx = CreateInMemoryContext("Update_NotFound");
        var service = new UserService(ctx);

        var result = await service.UpdateProfileAsync("u999", new UpdateProfileDto { FullName = "x" });

        Assert.Null(result);
    }

    // ✅ Test 8: SearchUsersAsync tìm theo username
    [Fact]
    public async Task SearchUsersAsync_ByUsername_ReturnsMatching()
    {
        var ctx = CreateInMemoryContext("Search_Username");
        ctx.Users.AddRange(
            CreateUser("u1", "nguyenvan"),
            CreateUser("u2", "tranthib")
        );
        await ctx.SaveChangesAsync();

        var service = new UserService(ctx);
        var result = await service.SearchUsersAsync("nguyen");

        Assert.Single(result);
        Assert.Equal("nguyenvan", result[0].Username);
    }

    // ✅ Test 9: SearchUsersAsync tìm theo FullName
    [Fact]
    public async Task SearchUsersAsync_ByFullName_ReturnsMatching()
    {
        var ctx = CreateInMemoryContext("Search_FullName");
        ctx.Users.Add(new User
        {
            Id = "u1", UserName = "user1",
            FullName = "Hoàng Phúc",
            Email = "user1@test.com"
        });
        await ctx.SaveChangesAsync();

        var service = new UserService(ctx);
        var result = await service.SearchUsersAsync("Hoàng");

        Assert.Single(result);
    }

    // ✅ Test 10: SearchUsersAsync không tìm thấy
    [Fact]
    public async Task SearchUsersAsync_NoMatch_ReturnsEmpty()
    {
        var ctx = CreateInMemoryContext("Search_NoMatch");
        ctx.Users.Add(CreateUser("u1", "user1"));
        await ctx.SaveChangesAsync();

        var service = new UserService(ctx);
        var result = await service.SearchUsersAsync("xyz999");

        Assert.Empty(result);
    }

    // ✅ Test 11: GetUserByIdAsync với currentUserId - friendStatus none
    [Fact]
    public async Task GetUserByIdAsync_WithCurrentUser_FriendStatusNone()
    {
        var ctx = CreateInMemoryContext("GetUser_Status_None");
        ctx.Users.AddRange(CreateUser("u1", "user1"), CreateUser("u2", "user2"));
        await ctx.SaveChangesAsync();

        var service = new UserService(ctx);
        var result = await service.GetUserByIdAsync("u2", "u1");

        Assert.Equal("none", result!.FriendStatus);
    }

    // ✅ Test 12: GetUserByIdAsync với currentUserId - friendStatus pending
    [Fact]
    public async Task GetUserByIdAsync_WithCurrentUser_FriendStatusPending()
    {
        var ctx = CreateInMemoryContext("GetUser_Status_Pending");
        ctx.Users.AddRange(CreateUser("u1", "user1"), CreateUser("u2", "user2"));
        ctx.Friendships.Add(new Friendship
        {
            SenderId = "u1", ReceiverId = "u2",
            Status = FriendshipStatus.Pending
        });
        await ctx.SaveChangesAsync();

        var service = new UserService(ctx);
        var result = await service.GetUserByIdAsync("u2", "u1");

        Assert.Equal("pending", result!.FriendStatus);
    }

    // ✅ Test 13: GetUserByIdAsync với currentUserId - friendStatus friend
    [Fact]
    public async Task GetUserByIdAsync_WithCurrentUser_FriendStatusFriend()
    {
        var ctx = CreateInMemoryContext("GetUser_Status_Friend");
        ctx.Users.AddRange(CreateUser("u1", "user1"), CreateUser("u2", "user2"));
        ctx.Friendships.Add(new Friendship
        {
            SenderId = "u1", ReceiverId = "u2",
            Status = FriendshipStatus.Accepted
        });
        await ctx.SaveChangesAsync();

        var service = new UserService(ctx);
        var result = await service.GetUserByIdAsync("u2", "u1");

        Assert.Equal("accepted", result!.FriendStatus);
    }

    // ✅ Test 14: GetUserByIdAsync xem profile của chính mình
    [Fact]
    public async Task GetUserByIdAsync_OwnProfile_FriendStatusNone()
    {
        var ctx = CreateInMemoryContext("GetUser_OwnProfile");
        ctx.Users.Add(CreateUser("u1", "user1"));
        await ctx.SaveChangesAsync();

        var service = new UserService(ctx);
        var result = await service.GetUserByIdAsync("u1", "u1");

        Assert.Equal("none", result!.FriendStatus);
    }

    // ✅ Test 15: SearchUsersAsync giới hạn 20 kết quả
    [Fact]
    public async Task SearchUsersAsync_LimitTo20Results()
    {
        var ctx = CreateInMemoryContext("Search_Limit");
        for (int i = 0; i < 25; i++)
        {
            ctx.Users.Add(new User
            {
                Id = $"u{i}",
                UserName = $"testuser{i}",
                FullName = $"Test User {i}",
                Email = $"user{i}@test.com"
            });
        }
        await ctx.SaveChangesAsync();

        var service = new UserService(ctx);
        var result = await service.SearchUsersAsync("testuser");

        Assert.Equal(20, result.Count);
    }
}