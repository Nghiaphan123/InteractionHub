using InteractHub.Core.DTOs.Posts;
using InteractHub.Core.DTOs.Comments;
using InteractHub.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // tất cả endpoints đều cần đăng nhập
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;

    public PostsController(IPostService postService)
    {
        _postService = postService;
    }

    // Lấy userId từ JWT token
    private string GetCurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    // GET /api/posts?page=1&pageSize=10
    [HttpGet]
    public async Task<IActionResult> GetPosts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var posts = await _postService.GetAllPostsAsync(
            GetCurrentUserId(), page, pageSize);
        return Ok(posts);
    }

    // GET /api/posts/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPost(int id)
    {
        var post = await _postService.GetPostByIdAsync(id, GetCurrentUserId());
        if (post == null) return NotFound(new { message = "Không tìm thấy post" });
        return Ok(post);
    }

    // POST /api/posts
    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostDto dto)
    {
        var post = await _postService.CreatePostAsync(GetCurrentUserId(), dto);
        return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
    }

    // PUT /api/posts/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePost(int id, [FromBody] UpdatePostDto dto)
    {
        var post = await _postService.UpdatePostAsync(id, GetCurrentUserId(), dto);
        if (post == null) return NotFound(new { message = "Không tìm thấy post hoặc không có quyền" });
        return Ok(post);
    }

    // DELETE /api/posts/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        var result = await _postService.DeletePostAsync(id, GetCurrentUserId());
        if (!result) return NotFound(new { message = "Không tìm thấy post hoặc không có quyền" });
        return NoContent();
    }

    // POST /api/posts/5/like
    [HttpPost("{id}/like")]
    public async Task<IActionResult> LikePost(int id)
    {
        var result = await _postService.LikePostAsync(id, GetCurrentUserId());
        if (!result) return BadRequest(new { message = "Đã like rồi" });
        return Ok(new { message = "Like thành công" });
    }

    // DELETE /api/posts/5/like
    [HttpDelete("{id}/like")]
    public async Task<IActionResult> UnlikePost(int id)
    {
        var result = await _postService.UnlikePostAsync(id, GetCurrentUserId());
        if (!result) return BadRequest(new { message = "Chưa like" });
        return Ok(new { message = "Unlike thành công" });
    }

    // GET /api/posts/5/comments
    [HttpGet("{id}/comments")]
    public async Task<IActionResult> GetComments(int id)
    {
        var comments = await _postService.GetCommentsAsync(id);
        return Ok(comments);
    }

    // POST /api/posts/5/comments
    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(int id, [FromBody] CreateCommentDto dto)
    {
        var comment = await _postService.AddCommentAsync(id, GetCurrentUserId(), dto);
        return Ok(comment);
    }

    // DELETE /api/posts/5/comments/3
    [HttpDelete("{id}/comments/{commentId}")]
    public async Task<IActionResult> DeleteComment(int id, int commentId)
    {
        var result = await _postService.DeleteCommentAsync(commentId, GetCurrentUserId());
        if (!result) return NotFound(new { message = "Không tìm thấy comment hoặc không có quyền" });
        return NoContent();
    }
}