using System.ComponentModel.DataAnnotations;

namespace InteractHub.Core.DTOs.Comments;

public class CreateCommentDto
{
    [Required]
    [MaxLength(1000)]
    public string Content { get; set; } = string.Empty;

    public int? ParentCommentId { get; set; } // reply
}