namespace InteractHub.Core.Entities;
using System.ComponentModel.DataAnnotations;
public enum ReportReason
{
    Spam,
    HateSpeech,
    Violence,
    FakeNews,
    NudityOrSexualContent,
    Other
}

public enum ReportStatus
{
    Pending,
    Reviewed,
    Resolved,
    Dismissed
}

public class PostReport
{
    public int Id { get; set; }
    public ReportReason Reason { get; set; }
    public ReportStatus Status { get; set; } = ReportStatus.Pending;

    [MaxLength(500)]
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }

    // Foreign Keys
    public string ReporterId { get; set; }
    public int PostId { get; set; }
    public string? ReviewedBy { get; set; }

    // Navigation Properties
    public User Reporter { get; set; }
    public Post Post { get; set; }
}


