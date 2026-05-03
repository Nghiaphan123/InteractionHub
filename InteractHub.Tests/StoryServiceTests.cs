using InteractHub.Core.DTOs.Stories;
using InteractHub.Core.Entities;
using InteractHub.Infrastructure.Data;
using InteractHub.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace InteractHub.Tests;

public class StoryServiceTests
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

    // ✅ Test 1: CreateStoryAsync tạo story thành công với content
    [Fact]
    public async Task CreateStoryAsync_WithContent_ReturnsStory()
    {
        var ctx = CreateInMemoryContext("CreateStory_Content");
        ctx.Users.Add(CreateUser("u1", "user1"));
        await ctx.SaveChangesAsync();

        var service = new StoryService(ctx);
        var dto = new CreateStoryDto { Content = "Hello story", BackgroundColor = "#1877f2" };

        var result = await service.CreateStoryAsync("u1", dto);

        Assert.NotNull(result);
        Assert.Equal("Hello story", result.Content);
        Assert.Equal("u1", result.UserId);
    }

    // ✅ Test 2: CreateStoryAsync tạo story với ảnh
    [Fact]
    public async Task CreateStoryAsync_WithImage_ReturnsStoryWithImageUrl()
    {
        var ctx = CreateInMemoryContext("CreateStory_Image");
        ctx.Users.Add(CreateUser("u1", "user1"));
        await ctx.SaveChangesAsync();

        var service = new StoryService(ctx);
        var dto = new CreateStoryDto { ImageUrl = "/uploads/story.png" };

        var result = await service.CreateStoryAsync("u1", dto);

        Assert.Equal("/uploads/story.png", result.ImageUrl);
    }

    // ✅ Test 3: CreateStoryAsync ExpiresAt là 24h sau
    [Fact]
    public async Task CreateStoryAsync_ExpiresAt_Is24HoursLater()
    {
        var ctx = CreateInMemoryContext("CreateStory_Expires");
        ctx.Users.Add(CreateUser("u1", "user1"));
        await ctx.SaveChangesAsync();

        var service = new StoryService(ctx);
        var before = DateTime.UtcNow;
        var result = await service.CreateStoryAsync("u1", new CreateStoryDto { Content = "test" });

        Assert.True(result.ExpiresAt >= before.AddHours(24));
    }

    // ✅ Test 4: GetStoriesAsync chỉ lấy story chưa hết hạn
    [Fact]
    public async Task GetStoriesAsync_ReturnsOnlyActiveStories()
    {
        var ctx = CreateInMemoryContext("GetStories_Active");
        ctx.Users.Add(CreateUser("u1", "user1"));
        ctx.Stories.AddRange(
            new Story
            {
                Content = "Active story",
                UserId = "u1",
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            },
            new Story
            {
                Content = "Expired story",
                UserId = "u1",
                CreatedAt = DateTime.UtcNow.AddHours(-25),
                ExpiresAt = DateTime.UtcNow.AddHours(-1)
            }
        );
        await ctx.SaveChangesAsync();

        var service = new StoryService(ctx);
        var result = await service.GetStoriesAsync("u1");

        Assert.Single(result);
        Assert.Equal("Active story", result[0].Content);
    }

    // ✅ Test 5: GetStoriesAsync trả về rỗng khi không có story
    [Fact]
    public async Task GetStoriesAsync_NoStories_ReturnsEmpty()
    {
        var ctx = CreateInMemoryContext("GetStories_Empty");
        var service = new StoryService(ctx);

        var result = await service.GetStoriesAsync("u1");

        Assert.Empty(result);
    }

    // ✅ Test 6: GetStoriesAsync trả về nhiều story
    [Fact]
    public async Task GetStoriesAsync_MultipleStories_ReturnsAll()
    {
        var ctx = CreateInMemoryContext("GetStories_Multiple");
        ctx.Users.AddRange(CreateUser("u1", "user1"), CreateUser("u2", "user2"));
        ctx.Stories.AddRange(
            new Story { Content = "Story 1", UserId = "u1", CreatedAt = DateTime.UtcNow, ExpiresAt = DateTime.UtcNow.AddHours(24) },
            new Story { Content = "Story 2", UserId = "u2", CreatedAt = DateTime.UtcNow, ExpiresAt = DateTime.UtcNow.AddHours(24) }
        );
        await ctx.SaveChangesAsync();

        var service = new StoryService(ctx);
        var result = await service.GetStoriesAsync("u1");

        Assert.Equal(2, result.Count);
    }

    // ✅ Test 7: DeleteStoryAsync xóa story thành công
    [Fact]
    public async Task DeleteStoryAsync_OwnStory_ReturnsTrue()
    {
        var ctx = CreateInMemoryContext("DeleteStory_Success");
        ctx.Users.Add(CreateUser("u1", "user1"));
        var story = new Story
        {
            Content = "Delete me",
            UserId = "u1",
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };
        ctx.Stories.Add(story);
        await ctx.SaveChangesAsync();

        var service = new StoryService(ctx);
        var result = await service.DeleteStoryAsync(story.Id, "u1");

        Assert.True(result);
        Assert.Empty(ctx.Stories.ToList());
    }

    // ✅ Test 8: DeleteStoryAsync story không phải của mình
    [Fact]
    public async Task DeleteStoryAsync_OtherUserStory_ReturnsFalse()
    {
        var ctx = CreateInMemoryContext("DeleteStory_Fail");
        ctx.Users.Add(CreateUser("u1", "user1"));
        var story = new Story
        {
            Content = "Not mine",
            UserId = "u1",
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };
        ctx.Stories.Add(story);
        await ctx.SaveChangesAsync();

        var service = new StoryService(ctx);
        var result = await service.DeleteStoryAsync(story.Id, "u2");

        Assert.False(result);
    }

    // ✅ Test 9: DeleteStoryAsync story không tồn tại
    [Fact]
    public async Task DeleteStoryAsync_NotFound_ReturnsFalse()
    {
        var ctx = CreateInMemoryContext("DeleteStory_NotFound");
        var service = new StoryService(ctx);

        var result = await service.DeleteStoryAsync(999, "u1");

        Assert.False(result);
    }

    // ✅ Test 10: CreateStoryAsync trả về đúng username
    [Fact]
    public async Task CreateStoryAsync_ReturnsCorrectUsername()
    {
        var ctx = CreateInMemoryContext("CreateStory_Username");
        ctx.Users.Add(CreateUser("u1", "testuser"));
        await ctx.SaveChangesAsync();

        var service = new StoryService(ctx);
        var result = await service.CreateStoryAsync("u1", new CreateStoryDto { Content = "test" });

        Assert.Equal("testuser", result.Username);
    }
}