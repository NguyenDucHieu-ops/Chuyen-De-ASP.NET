using System.ComponentModel.DataAnnotations;

namespace NguyenDucHieu_2123110416.Models
{
    public class ActivityLog
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; } // ID của Admin thực hiện
        public string ActionType { get; set; } = string.Empty; // "CREATE", "UPDATE", "DELETE"
        public string EntityName { get; set; } = string.Empty; // Tên bảng (Products, Categories...)
        public string EntityId { get; set; } = string.Empty; // ID của dữ liệu bị thay đổi

        public string? OldValues { get; set; } // Dữ liệu cũ (dạng JSON)
        public string? NewValues { get; set; } // Dữ liệu mới (dạng JSON)

        public DateTime Timestamp { get; set; } = DateTime.Now;
    }
}