using System.ComponentModel.DataAnnotations;

namespace InteractHub.Core.DTOs.Posts;

public class UpdatePostDto
{
    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;
}