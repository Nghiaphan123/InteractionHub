using InteractHub.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace InteractHub.Infrastructure.Data;
public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Post> Posts { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Like> Likes { get; set; }
    public DbSet<Friendship> Friendships { get; set; }
    public DbSet<Story> Stories { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Hashtag> Hashtags { get; set; }
    public DbSet<PostHashtag> PostHashtags { get; set; }
    public DbSet<PostReport> PostReports { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        
        // Bỏ qua cảnh báo PendingModelChangesWarning
        optionsBuilder.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder); // PHẢI gọi dòng này trước

        // ==================== POST ====================
        builder.Entity<Post>()
            .HasOne(p => p.User)
            .WithMany(u => u.Posts)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ==================== COMMENT ====================
        builder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.NoAction); // tránh multiple cascade

        builder.Entity<Comment>()
            .HasOne(c => c.Post)
            .WithMany(p => p.Comments)
            .HasForeignKey(c => c.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Comment>()
            .HasOne(c => c.ParentComment)
            .WithMany(c => c.Replies)
            .HasForeignKey(c => c.ParentCommentId)
            .OnDelete(DeleteBehavior.NoAction);

        // ==================== LIKE ====================
        builder.Entity<Like>()
            .HasOne(l => l.User)
            .WithMany(u => u.Likes)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.Entity<Like>()
            .HasOne(l => l.Post)
            .WithMany(p => p.Likes)
            .HasForeignKey(l => l.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Like>()
            .HasOne(l => l.Comment)
            .WithMany(c => c.Likes)
            .HasForeignKey(l => l.CommentId)
            .OnDelete(DeleteBehavior.NoAction);

        // Không cho like cùng 1 post 2 lần
        builder.Entity<Like>()
            .HasIndex(l => new { l.UserId, l.PostId })
            .IsUnique()
            .HasFilter("[PostId] IS NOT NULL");

        // ==================== FRIENDSHIP ====================
        // Friendship có 2 FK trỏ về User nên phải dùng NoAction
        builder.Entity<Friendship>()
            .HasOne(f => f.Sender)
            .WithMany(u => u.SentFriendships)
            .HasForeignKey(f => f.SenderId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.Entity<Friendship>()
            .HasOne(f => f.Receiver)
            .WithMany(u => u.ReceivedFriendships)
            .HasForeignKey(f => f.ReceiverId)
            .OnDelete(DeleteBehavior.NoAction);

        // Không cho gửi lời mời kết bạn 2 lần
        builder.Entity<Friendship>()
            .HasIndex(f => new { f.SenderId, f.ReceiverId })
            .IsUnique();

        // ==================== STORY ====================
        builder.Entity<Story>()
            .HasOne(s => s.User)
            .WithMany(u => u.Stories)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ==================== NOTIFICATION ====================
        // Notification có 2 FK trỏ về User nên phải dùng NoAction
        builder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.ReceivedNotifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.Entity<Notification>()
            .HasOne(n => n.Sender)
            .WithMany(u => u.SentNotifications)
            .HasForeignKey(n => n.SenderId)
            .OnDelete(DeleteBehavior.NoAction);

        // ==================== HASHTAG ====================
        // PostHashtag là bảng trung gian Many-to-Many
        builder.Entity<PostHashtag>()
            .HasKey(ph => new { ph.PostId, ph.HashtagId }); // composite key

        builder.Entity<PostHashtag>()
            .HasOne(ph => ph.Post)
            .WithMany(p => p.PostHashtags)
            .HasForeignKey(ph => ph.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<PostHashtag>()
            .HasOne(ph => ph.Hashtag)
            .WithMany(h => h.PostHashtags)
            .HasForeignKey(ph => ph.HashtagId)
            .OnDelete(DeleteBehavior.Cascade);

        // Hashtag name là unique
        builder.Entity<Hashtag>()
            .HasIndex(h => h.Name)
            .IsUnique();

        // ==================== POSTREPORT ====================
        builder.Entity<PostReport>()
            .HasOne(pr => pr.Reporter)
            .WithMany(u => u.PostReports)
            .HasForeignKey(pr => pr.ReporterId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.Entity<PostReport>()
            .HasOne(pr => pr.Post)
            .WithMany(p => p.PostReports)
            .HasForeignKey(pr => pr.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        // ==================== SEED DATA ====================
        builder.Entity<IdentityRole>().HasData(
            new IdentityRole
            {
                Id = "1",
                Name = "Admin",
                NormalizedName = "ADMIN"
            },
            new IdentityRole
            {
                Id = "2",
                Name = "User",
                NormalizedName = "USER"
            }
        );
        builder.Entity<User>().HasData(
            new User
            {
            Id = "user-1",
            UserName = "john_doe",
            Email = "john@example.com",
            FullName = "John Doe",
            CreatedAt = DateTime.UtcNow,
            PasswordHash = "hashed_password_here" // Use BCrypt to hash
             }
        );
    }
}