using InteractHub.Core.DTOs.Comments;
using InteractHub.Core.DTOs.Posts;
using InteractHub.Core.Entities;
using InteractHub.Infrastructure.Data;
using InteractHub.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace InteractHub.Tests;

public class PostServiceTests
{
    private AppDbContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new AppDbContext(options);
    }

    private User CreateTestUser(string id = "user1", string username = "testuser")
    {
        return new User
        {
            Id = id,
            UserName = username,
            FullName = "Test User",
            Email = $"{username}@test.com"
        };
    }

    // ✅ Test 1: CreatePost thành công
    [Fact]
    public async Task CreatePostAsync_ValidData_ReturnsPost()
    {
        var ctx = CreateInMemoryContext("CreatePost_Valid");
        var user = CreateTestUser();
        ctx.Users.Add(user);
        await ctx.SaveChangesAsync();

        var service = new PostService(ctx);
        var dto = new CreatePostDto { Content = "Hello world" };

        var result = await service.CreatePostAsync(user.Id, dto);

        Assert.NotNull(result);
        Assert.Equal("Hello world", result.Content);
        Assert.Equal(user.Id, result.UserId);
    }

    // ✅ Test 2: CreatePost với imageUrl
    [Fact]
    public async Task CreatePostAsync_WithImage_ReturnsPostWithImageUrl()
    {
        var ctx = CreateInMemoryContext("CreatePost_Image");
        var user = CreateTestUser();
        ctx.Users.Add(user);
        await ctx.SaveChangesAsync();

        var service = new PostService(ctx);
        var dto = new CreatePostDto { Content = "Post with image", ImageUrl = "/uploads/test.png" };

        var result = await service.CreatePostAsync(user.Id, dto);

        Assert.Equal("/uploads/test.png", result.ImageUrl);
    }

    // ✅ Test 3: GetAllPostsAsync trả về danh sách posts
    [Fact]
    public async Task GetAllPostsAsync_ReturnsPosts()
    {
        var ctx = CreateInMemoryContext("GetAllPosts");
        var user = CreateTestUser();
        ctx.Users.Add(user);
        ctx.Posts.AddRange(
            new Post { Content = "Post 1", UserId = user.Id, CreatedAt = DateTime.UtcNow },
            new Post { Content = "Post 2", UserId = user.Id, CreatedAt = DateTime.UtcNow }
        );
        await ctx.SaveChangesAsync();

        var service = new PostService(ctx);
        var result = await service.GetAllPostsAsync(user.Id);

        Assert.Equal(2, result.Count);
    }

    // ✅ Test 4: GetAllPostsAsync trả về rỗng khi không có post
    [Fact]
    public async Task GetAllPostsAsync_NoPosts_ReturnsEmptyList()
    {
        var ctx = CreateInMemoryContext("GetAllPosts_Empty");
        var service = new PostService(ctx);

        var result = await service.GetAllPostsAsync("user1");

        Assert.Empty(result);
    }

    // ✅ Test 5: GetPostByIdAsync tìm thấy post
    [Fact]
    public async Task GetPostByIdAsync_ExistingPost_ReturnsPost()
    {
        var ctx = CreateInMemoryContext("GetById_Found");
        var user = CreateTestUser();
        ctx.Users.Add(user);
        var post = new Post { Content = "Test post", UserId = user.Id, CreatedAt = DateTime.UtcNow };
        ctx.Posts.Add(post);
        await ctx.SaveChangesAsync();

        var service = new PostService(ctx);
        var result = await service.GetPostByIdAsync(post.Id, user.Id);

        Assert.NotNull(result);
        Assert.Equal("Test post", result.Content);
    }

    // ✅ Test 6: GetPostByIdAsync không tìm thấy post
    [Fact]
    public async Task GetPostByIdAsync_NotFound_ReturnsNull()
    {
        var ctx = CreateInMemoryContext("GetById_NotFound");
        var service = new PostService(ctx);

        var result = await service.GetPostByIdAsync(999, "user1");

        Assert.Null(result);
    }

    // ✅ Test 7: DeletePostAsync xóa thành công
    [Fact]
    public async Task DeletePostAsync_OwnPost_ReturnsTrue()
    {
        var ctx = CreateInMemoryContext("Delete_Success");
        var user = CreateTestUser();
        ctx.Users.Add(user);
        var post = new Post { Content = "Delete me", UserId = user.Id, CreatedAt = DateTime.UtcNow };
        ctx.Posts.Add(post);
        await ctx.SaveChangesAsync();

        var service = new PostService(ctx);
        var result = await service.DeletePostAsync(post.Id, user.Id);

        Assert.True(result);
        Assert.Empty(ctx.Posts.ToList());
    }

    // ✅ Test 8: DeletePostAsync không phải của mình
    [Fact]
    public async Task DeletePostAsync_OtherUserPost_ReturnsFalse()
    {
        var ctx = CreateInMemoryContext("Delete_Fail");
        var user = CreateTestUser();
        ctx.Users.Add(user);
        var post = new Post { Content = "Not mine", UserId = user.Id, CreatedAt = DateTime.UtcNow };
        ctx.Posts.Add(post);
        await ctx.SaveChangesAsync();

        var service = new PostService(ctx);
        var result = await service.DeletePostAsync(post.Id, "other_user");

        Assert.False(result);
    }

    // ✅ Test 9: UpdatePostAsync cập nhật thành công
    [Fact]
    public async Task UpdatePostAsync_OwnPost_ReturnsUpdatedPost()
    {
        var ctx = CreateInMemoryContext("Update_Success");
        var user = CreateTestUser();
        ctx.Users.Add(user);
        var post = new Post { Content = "Old content", UserId = user.Id, CreatedAt = DateTime.UtcNow };
        ctx.Posts.Add(post);
        await ctx.SaveChangesAsync();

        var service = new PostService(ctx);
        var result = await service.UpdatePostAsync(post.Id, user.Id, new UpdatePostDto { Content = "New content" });

        Assert.NotNull(result);
        Assert.Equal("New content", result.Content);
    }

    // ✅ Test 10: UpdatePostAsync post không tồn tại
    [Fact]
    public async Task UpdatePostAsync_NotFound_ReturnsNull()
    {
        var ctx = CreateInMemoryContext("Update_NotFound");
        var service = new PostService(ctx);

        var result = await service.UpdatePostAsync(999, "user1", new UpdatePostDto { Content = "x" });

        Assert.Null(result);
    }

    // ✅ Test 11: LikePostAsync like thành công
    [Fact]
    public async Task LikePostAsync_NotLikedYet_ReturnsTrue()
    {
        var ctx = CreateInMemoryContext("Like_Success");
        var user = CreateTestUser();
        ctx.Users.Add(user);
        var post = new Post { Content = "Like me", UserId = user.Id, CreatedAt = DateTime.UtcNow };
        ctx.Posts.Add(post);
        await ctx.SaveChangesAsync();

        var service = new PostService(ctx);
        var result = await service.LikePostAsync(post.Id, user.Id);

        Assert.True(result);
    }

    // ✅ Test 12: LikePostAsync đã like rồi
    [Fact]
    public async Task LikePostAsync_AlreadyLiked_ReturnsFalse()
    {
        var ctx = CreateInMemoryContext("Like_Duplicate");
        var user = CreateTestUser();
        ctx.Users.Add(user);
        var post = new Post { Content = "Like me", UserId = user.Id, CreatedAt = DateTime.UtcNow };
        ctx.Posts.Add(post);
        await ctx.SaveChangesAsync();

        ctx.Likes.Add(new Like { PostId = post.Id, UserId = user.Id, CreatedAt = DateTime.UtcNow });
        await ctx.SaveChangesAsync();

        var service = new PostService(ctx);
        var result = await service.LikePostAsync(post.Id, user.Id);

        Assert.False(result);
    }

    // ✅ Test 13: UnlikePostAsync unlike thành công
    [Fact]
    public async Task UnlikePostAsync_HasLike_ReturnsTrue()
    {
        var ctx = CreateInMemoryContext("Unlike_Success");
        var user = CreateTestUser();
        ctx.Users.Add(user);
        var post = new Post { Content = "Unlike me", UserId = user.Id, CreatedAt = DateTime.UtcNow };
        ctx.Posts.Add(post);
        ctx.Likes.Add(new Like { PostId = post.Id, UserId = user.Id, CreatedAt = DateTime.UtcNow });
        await ctx.SaveChangesAsync();

        var service = new PostService(ctx);
        var result = await service.UnlikePostAsync(post.Id, user.Id);

        Assert.True(result);
    }

    // ✅ Test 14: UnlikePostAsync chưa like
    [Fact]
    public async Task UnlikePostAsync_NoLike_ReturnsFalse()
    {
        var ctx = CreateInMemoryContext("Unlike_Fail");
        var service = new PostService(ctx);

        var result = await service.UnlikePostAsync(1, "user1");

        Assert.False(result);
    }

    // ✅ Test 15: GetPostsByUserIdAsync lấy đúng posts của user
    [Fact]
    public async Task GetPostsByUserIdAsync_ReturnsOnlyUserPosts()
    {
        var ctx = CreateInMemoryContext("GetByUser");
        var user1 = CreateTestUser("user1", "user1");
        var user2 = CreateTestUser("user2", "user2");
        ctx.Users.AddRange(user1, user2);
        ctx.Posts.AddRange(
            new Post { Content = "User1 post", UserId = "user1", CreatedAt = DateTime.UtcNow },
            new Post { Content = "User2 post", UserId = "user2", CreatedAt = DateTime.UtcNow }
        );
        await ctx.SaveChangesAsync();

        var service = new PostService(ctx);
        var result = await service.GetPostsByUserIdAsync("user1", "user1");

        Assert.Single(result);
        Assert.Equal("User1 post", result[0].Content);
    }

    // ✅ Test 16: DeleteCommentAsync xóa comment thành công
    [Fact]
    public async Task DeleteCommentAsync_OwnComment_ReturnsTrue()
    {
        var ctx = CreateInMemoryContext("DeleteComment_Success");
        var user = CreateTestUser();
        ctx.Users.Add(user);
        var post = new Post { Content = "Post", UserId = user.Id, CreatedAt = DateTime.UtcNow };
        ctx.Posts.Add(post);
        await ctx.SaveChangesAsync();

        var comment = new Comment { Content = "Comment", PostId = post.Id, UserId = user.Id, CreatedAt = DateTime.UtcNow };
        ctx.Comments.Add(comment);
        await ctx.SaveChangesAsync();

        var service = new PostService(ctx);
        var result = await service.DeleteCommentAsync(comment.Id, user.Id);

        Assert.True(result);
    }

    // ✅ Test 17: DeleteCommentAsync comment không phải của mình
    [Fact]
    public async Task DeleteCommentAsync_OtherUserComment_ReturnsFalse()
    {
        var ctx = CreateInMemoryContext("DeleteComment_Fail");
        var user = CreateTestUser();
        ctx.Users.Add(user);
        var post = new Post { Content = "Post", UserId = user.Id, CreatedAt = DateTime.UtcNow };
        ctx.Posts.Add(post);
        var comment = new Comment { Content = "Comment", PostId = post.Id, UserId = user.Id, CreatedAt = DateTime.UtcNow };
        ctx.Comments.Add(comment);
        await ctx.SaveChangesAsync();

        var service = new PostService(ctx);
        var result = await service.DeleteCommentAsync(comment.Id, "other_user");

        Assert.False(result);
    }
}
