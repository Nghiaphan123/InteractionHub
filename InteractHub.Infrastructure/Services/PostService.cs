using InteractHub.Core.DTOs.Comments;
using InteractHub.Core.DTOs.Posts;
using InteractHub.Core.Entities;
using InteractHub.Core.Interfaces;
using InteractHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Infrastructure.Services;

public class PostService : IPostService
{
    private readonly AppDbContext _context;

    public PostService(AppDbContext context)
    {
        _context = context;
    }

    // Lấy tất cả posts (có phân trang)
    public async Task<List<PostResponseDto>> GetAllPostsAsync(
        string currentUserId, int page = 1, int pageSize = 10)
    {
        return await _context.Posts
            .Include(p => p.User)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PostResponseDto
            {
                Id = p.Id,
                Content = p.Content,
                ImageUrl = p.ImageUrl,
                CreatedAt = p.CreatedAt,
                UserId = p.UserId,
                Username = p.User.UserName!,
                FullName = p.User.FullName,
                AvatarUrl = p.User.AvatarUrl,
                LikesCount = p.Likes.Count,
                CommentsCount = p.Comments.Count,
                IsLikedByCurrentUser = p.Likes.Any(l => l.UserId == currentUserId)
            })
            .ToListAsync();
    }

    // Lấy post theo ID
    public async Task<PostResponseDto?> GetPostByIdAsync(int postId, string currentUserId)
    {
        var post = await _context.Posts
            .Include(p => p.User)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .FirstOrDefaultAsync(p => p.Id == postId);

        if (post == null) return null;

        return new PostResponseDto
        {
            Id = post.Id,
            Content = post.Content,
            ImageUrl = post.ImageUrl,
            CreatedAt = post.CreatedAt,
            UserId = post.UserId,
            Username = post.User.UserName!,
            FullName = post.User.FullName,
            AvatarUrl = post.User.AvatarUrl,
            LikesCount = post.Likes.Count,
            CommentsCount = post.Comments.Count,
            IsLikedByCurrentUser = post.Likes.Any(l => l.UserId == currentUserId)
        };
    }

    // Tạo post mới
    public async Task<PostResponseDto> CreatePostAsync(string userId, CreatePostDto dto)
    {
        var post = new Post
        {
            Content = dto.Content,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Posts.Add(post);
        await _context.SaveChangesAsync();

        return await GetPostByIdAsync(post.Id, userId) ?? throw new Exception("Lỗi tạo post");
    }

    // Cập nhật post
    public async Task<PostResponseDto?> UpdatePostAsync(
        int postId, string userId, UpdatePostDto dto)
    {
        var post = await _context.Posts.FirstOrDefaultAsync(
            p => p.Id == postId && p.UserId == userId);

        if (post == null) return null;

        post.Content = dto.Content;
        await _context.SaveChangesAsync();

        return await GetPostByIdAsync(postId, userId);
    }

    // Xóa post
    public async Task<bool> DeletePostAsync(int postId, string userId)
    {
        var post = await _context.Posts.FirstOrDefaultAsync(
            p => p.Id == postId && p.UserId == userId);

        if (post == null) return false;

        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();
        return true;
    }

    // Like post
    public async Task<bool> LikePostAsync(int postId, string userId)
    {
        var existing = await _context.Likes.FirstOrDefaultAsync(
            l => l.PostId == postId && l.UserId == userId);

        if (existing != null) return false; // đã like rồi

        _context.Likes.Add(new Like
        {
            PostId = postId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return true;
    }

    // Unlike post
    public async Task<bool> UnlikePostAsync(int postId, string userId)
    {
        var like = await _context.Likes.FirstOrDefaultAsync(
            l => l.PostId == postId && l.UserId == userId);

        if (like == null) return false;

        _context.Likes.Remove(like);
        await _context.SaveChangesAsync();
        return true;
    }

    // Lấy comments của post
    public async Task<List<CommentResponseDto>> GetCommentsAsync(int postId)
    {
        return await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Replies).ThenInclude(r => r.User)
            .Where(c => c.PostId == postId && c.ParentCommentId == null)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CommentResponseDto
            {
                Id = c.Id,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                UserId = c.UserId,
                Username = c.User.UserName!,
                AvatarUrl = c.User.AvatarUrl,
                Replies = c.Replies.Select(r => new CommentResponseDto
                {
                    Id = r.Id,
                    Content = r.Content,
                    CreatedAt = r.CreatedAt,
                    UserId = r.UserId,
                    Username = r.User.UserName!,
                    AvatarUrl = r.User.AvatarUrl
                }).ToList()
            })
            .ToListAsync();
    }

    // Thêm comment
    public async Task<CommentResponseDto> AddCommentAsync(
        int postId, string userId, CreateCommentDto dto)
    {
        var comment = new Comment
        {
            Content = dto.Content,
            PostId = postId,
            UserId = userId,
            ParentCommentId = dto.ParentCommentId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        return new CommentResponseDto
        {
            Id = comment.Id,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            UserId = userId,
            Username = user!.UserName!,
            AvatarUrl = user.AvatarUrl,
            ParentCommentId = comment.ParentCommentId
        };
    }

    // Xóa comment
    public async Task<bool> DeleteCommentAsync(int commentId, string userId)
    {
        var comment = await _context.Comments.FirstOrDefaultAsync(
            c => c.Id == commentId && c.UserId == userId);

        if (comment == null) return false;

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
        return true;
    }
}