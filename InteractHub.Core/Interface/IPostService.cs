using InteractHub.Core.DTOs.Posts;
using InteractHub.Core.DTOs.Comments;

namespace InteractHub.Core.Interfaces;

public interface IPostService
{
    // Posts
    Task<List<PostResponseDto>> GetAllPostsAsync(string currentUserId, int page = 1, int pageSize = 10);
    Task<PostResponseDto?> GetPostByIdAsync(int postId, string currentUserId);
    Task<PostResponseDto> CreatePostAsync(string userId, CreatePostDto dto);
    Task<PostResponseDto?> UpdatePostAsync(int postId, string userId, UpdatePostDto dto);
    Task<bool> DeletePostAsync(int postId, string userId);

    // Likes
    Task<bool> LikePostAsync(int postId, string userId);
    Task<bool> UnlikePostAsync(int postId, string userId);

    // Comments
    Task<List<CommentResponseDto>> GetCommentsAsync(int postId);
    Task<CommentResponseDto> AddCommentAsync(int postId, string userId, CreateCommentDto dto);
    Task<bool> DeleteCommentAsync(int commentId, string userId);
}