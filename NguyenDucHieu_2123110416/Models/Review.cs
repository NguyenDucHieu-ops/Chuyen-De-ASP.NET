using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class Review : BaseAuditEntity // Thêm Audit để quản lý xóa/sửa
    {
        [Key] public int Id { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")] public User? User { get; set; }

        public int ProductId { get; set; }
        [ForeignKey("ProductId")] public Product? Product { get; set; }
        // Thêm dòng này vào class Review
        public string? AdminReply { get; set; }
        public int OrderId { get; set; } // Liên kết với đơn hàng để chứng minh đã mua
        [ForeignKey("OrderId")] public Order? Order { get; set; }

        [Range(1, 5, ErrorMessage = "Đánh giá từ 1 đến 5 sao")]
        public int Rating { get; set; }

        [StringLength(500)]
        public string Comment { get; set; } = string.Empty;

        public ICollection<ReviewImage> ReviewImages { get; set; } = new List<ReviewImage>();
    }
}