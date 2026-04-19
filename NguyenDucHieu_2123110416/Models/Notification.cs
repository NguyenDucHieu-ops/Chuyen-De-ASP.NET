using System.ComponentModel.DataAnnotations;

namespace NguyenDucHieu_2123110416.Models
{
    public class Notification : BaseAuditEntity
    {
        [Key] public int Id { get; set; }

        public int UserId { get; set; } // ID người nhận (Admin = 0 hoặc ID cụ thể của khách)

        [Required]
        [StringLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false; // Đã đọc chưa?

        [StringLength(100)]
        public string? Type { get; set; } // Ví dụ: "ORDER_SUCCESS", "SYSTEM"

        public string? LinkUrl { get; set; } // Link bấm vào (VD: /profile/orders/123)
    }
}
// Nhớ thêm public DbSet<Notification> Notifications { get; set; } vào AppDbContext và chạy Migration nhé!