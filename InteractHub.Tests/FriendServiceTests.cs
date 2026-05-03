using InteractHub.Core.Entities;
using InteractHub.Infrastructure.Data;
using InteractHub.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace InteractHub.Tests;

public class FriendServiceTests
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
        FullName = $"User {username}",
        Email = $"{username}@test.com"
    };

    // ✅ Test 1: Gửi lời mời kết bạn thành công
    [Fact]
    public async Task SendFriendRequestAsync_Valid_ReturnsFriendship()
    {
        var ctx = CreateInMemoryContext("Send_Valid");
        ctx.Users.AddRange(CreateUser("u1", "user1"), CreateUser("u2", "user2"));
        await ctx.SaveChangesAsync();

        var service = new FriendService(ctx);
        var result = await service.SendFriendRequestAsync("u1", "u2");

        Assert.NotNull(result);
        Assert.Equal("u1", result.SenderId);
        Assert.Equal("u2", result.ReceiverId);
        Assert.Equal("Pending", result.Status);
    }

    // ✅ Test 2: Gửi lời mời khi receiver không tồn tại
    [Fact]
    public async Task SendFriendRequestAsync_ReceiverNotFound_ThrowsException()
    {
        var ctx = CreateInMemoryContext("Send_NoReceiver");
        ctx.Users.Add(CreateUser("u1", "user1"));
        await ctx.SaveChangesAsync();

        var service = new FriendService(ctx);
        await Assert.ThrowsAsync<Exception>(() =>
            service.SendFriendRequestAsync("u1", "u999"));
    }

    // ✅ Test 3: Gửi lời mời khi sender không tồn tại
    [Fact]
    public async Task SendFriendRequestAsync_SenderNotFound_ThrowsException()
    {
        var ctx = CreateInMemoryContext("Send_NoSender");
        ctx.Users.Add(CreateUser("u2", "user2"));
        await ctx.SaveChangesAsync();

        var service = new FriendService(ctx);
        await Assert.ThrowsAsync<Exception>(() =>
            service.SendFriendRequestAsync("u999", "u2"));
    }

    // ✅ Test 4: Gửi lời mời trùng lặp
    [Fact]
    public async Task SendFriendRequestAsync_Duplicate_ThrowsException()
    {
        var ctx = CreateInMemoryContext("Send_Duplicate");
        ctx.Users.AddRange(CreateUser("u1", "user1"), CreateUser("u2", "user2"));
        ctx.Friendships.Add(new Friendship
        {
            SenderId = "u1", ReceiverId = "u2",
            Status = FriendshipStatus.Pending
        });
        await ctx.SaveChangesAsync();

        var service = new FriendService(ctx);
        await Assert.ThrowsAsync<Exception>(() =>
            service.SendFriendRequestAsync("u1", "u2"));
    }

    // ✅ Test 5: Tự gửi lời mời cho bản thân
    [Fact]
    public async Task SendFriendRequestAsync_SelfRequest_ThrowsException()
    {
        var ctx = CreateInMemoryContext("Send_Self");
        ctx.Users.Add(CreateUser("u1", "user1"));
        await ctx.SaveChangesAsync();

        var service = new FriendService(ctx);
        await Assert.ThrowsAsync<Exception>(() =>
            service.SendFriendRequestAsync("u1", "u1"));
    }

    // ✅ Test 6: Chấp nhận lời mời thành công
    [Fact]
    public async Task AcceptFriendRequestAsync_Valid_ReturnsAccepted()
    {
        var ctx = CreateInMemoryContext("Accept_Valid");
        ctx.Users.AddRange(CreateUser("u1", "user1"), CreateUser("u2", "user2"));
        var friendship = new Friendship
        {
            SenderId = "u1", ReceiverId = "u2",
            Status = FriendshipStatus.Pending
        };
        ctx.Friendships.Add(friendship);
        await ctx.SaveChangesAsync();

        var service = new FriendService(ctx);
        var result = await service.AcceptFriendRequestAsync(friendship.Id, "u2");

        Assert.NotNull(result);
        Assert.Equal("Accepted", result.Status);
    }

    // ✅ Test 7: Chấp nhận lời mời không tồn tại
    [Fact]
    public async Task AcceptFriendRequestAsync_NotFound_ReturnsNull()
    {
        var ctx = CreateInMemoryContext("Accept_NotFound");
        var service = new FriendService(ctx);

        var result = await service.AcceptFriendRequestAsync(999, "u1");

        Assert.Null(result);
    }

    // ✅ Test 8: Từ chối lời mời thành công
    [Fact]
    public async Task DeclineFriendRequestAsync_Valid_ReturnsDeclined()
    {
        var ctx = CreateInMemoryContext("Decline_Valid");
        ctx.Users.AddRange(CreateUser("u1", "user1"), CreateUser("u2", "user2"));
        var friendship = new Friendship
        {
            SenderId = "u1", ReceiverId = "u2",
            Status = FriendshipStatus.Pending
        };
        ctx.Friendships.Add(friendship);
        await ctx.SaveChangesAsync();

        var service = new FriendService(ctx);
        var result = await service.DeclineFriendRequestAsync(friendship.Id, "u2");

        Assert.NotNull(result);
        Assert.Equal("Declined", result.Status);
    }

    // ✅ Test 9: Từ chối lời mời không tồn tại
    [Fact]
    public async Task DeclineFriendRequestAsync_NotFound_ReturnsNull()
    {
        var ctx = CreateInMemoryContext("Decline_NotFound");
        var service = new FriendService(ctx);

        var result = await service.DeclineFriendRequestAsync(999, "u1");

        Assert.Null(result);
    }

    // ✅ Test 10: Hủy kết bạn thành công
    [Fact]
    public async Task UnfriendAsync_ExistingFriendship_ReturnsTrue()
    {
        var ctx = CreateInMemoryContext("Unfriend_Success");
        ctx.Users.AddRange(CreateUser("u1", "user1"), CreateUser("u2", "user2"));
        ctx.Friendships.Add(new Friendship
        {
            SenderId = "u1", ReceiverId = "u2",
            Status = FriendshipStatus.Accepted
        });
        await ctx.SaveChangesAsync();

        var service = new FriendService(ctx);
        var result = await service.UnfriendAsync("u1", "u2");

        Assert.True(result);
        Assert.Empty(ctx.Friendships.ToList());
    }

    // ✅ Test 11: Hủy kết bạn không tồn tại
    [Fact]
    public async Task UnfriendAsync_NotFound_ReturnsFalse()
    {
        var ctx = CreateInMemoryContext("Unfriend_Fail");
        var service = new FriendService(ctx);

        var result = await service.UnfriendAsync("u1", "u2");

        Assert.False(result);
    }

    // ✅ Test 12: Lấy danh sách bạn bè
    [Fact]
    public async Task GetFriendsAsync_ReturnsFriends()
    {
        var ctx = CreateInMemoryContext("GetFriends");
        ctx.Users.AddRange(CreateUser("u1", "user1"), CreateUser("u2", "user2"));
        ctx.Friendships.Add(new Friendship
        {
            SenderId = "u1", ReceiverId = "u2",
            Status = FriendshipStatus.Accepted
        });
        await ctx.SaveChangesAsync();

        var service = new FriendService(ctx);
        var result = await service.GetFriendsAsync("u1");

        Assert.Single(result);
    }

    // ✅ Test 13: Lấy lời mời đang chờ
    [Fact]
    public async Task GetPendingRequestsAsync_ReturnsPendingRequests()
    {
        var ctx = CreateInMemoryContext("GetPending");
        ctx.Users.AddRange(CreateUser("u1", "user1"), CreateUser("u2", "user2"));
        ctx.Friendships.Add(new Friendship
        {
            SenderId = "u1", ReceiverId = "u2",
            Status = FriendshipStatus.Pending
        });
        await ctx.SaveChangesAsync();

        var service = new FriendService(ctx);
        var result = await service.GetPendingRequestsAsync("u2");

        Assert.Single(result);
    }

    // ✅ Test 14: Kiểm tra trạng thái friendship
    [Fact]
    public async Task GetFriendshipStatusAsync_Accepted_ReturnsAccepted()
    {
        var ctx = CreateInMemoryContext("GetStatus");
        ctx.Users.AddRange(CreateUser("u1", "user1"), CreateUser("u2", "user2"));
        ctx.Friendships.Add(new Friendship
        {
            SenderId = "u1", ReceiverId = "u2",
            Status = FriendshipStatus.Accepted
        });
        await ctx.SaveChangesAsync();

        var service = new FriendService(ctx);
        var result = await service.GetFriendshipStatusAsync("u1", "u2");

        Assert.Equal("Accepted", result);
    }

    // ✅ Test 15: Kiểm tra trạng thái không có friendship
    [Fact]
    public async Task GetFriendshipStatusAsync_NoFriendship_ReturnsNone()
    {
        var ctx = CreateInMemoryContext("GetStatus_None");
        var service = new FriendService(ctx);

        var result = await service.GetFriendshipStatusAsync("u1", "u2");

        Assert.Equal("None", result);
    }

    // ✅ Test 16: Hủy lời mời đã gửi thành công
    [Fact]
    public async Task CancelFriendRequestAsync_Valid_ReturnsTrue()
    {
        var ctx = CreateInMemoryContext("Cancel_Valid");
        ctx.Users.AddRange(CreateUser("u1", "user1"), CreateUser("u2", "user2"));
        ctx.Friendships.Add(new Friendship
        {
            SenderId = "u1", ReceiverId = "u2",
            Status = FriendshipStatus.Pending
        });
        await ctx.SaveChangesAsync();

        var service = new FriendService(ctx);
        var result = await service.CancelFriendRequestAsync("u1", "u2");

        Assert.True(result);
    }

    // ✅ Test 17: Hủy lời mời không tồn tại
    [Fact]
    public async Task CancelFriendRequestAsync_NotFound_ReturnsFalse()
    {
        var ctx = CreateInMemoryContext("Cancel_NotFound");
        var service = new FriendService(ctx);

        var result = await service.CancelFriendRequestAsync("u1", "u2");

        Assert.False(result);
    }
}