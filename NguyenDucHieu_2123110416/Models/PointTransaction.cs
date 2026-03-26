using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class PointTransaction
    {
        [Key] public int Id { get; set; }
        public int UserId { get; set; }
        [ForeignKey("UserId")] public User User { get; set; }

        public int? OrderId { get; set; } // Nullable vì có thể cộng điểm do Event, không phải do mua hàng
        [ForeignKey("OrderId")] public Order? Order { get; set; }

        public int Points { get; set; }
        [StringLength(255)] public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}