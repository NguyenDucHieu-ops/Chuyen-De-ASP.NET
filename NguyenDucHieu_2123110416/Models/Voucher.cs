using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class Voucher : BaseAuditEntity // Kế thừa để theo dõi người tạo/xóa
    {
        [Key] public int Id { get; set; }

        [Required(ErrorMessage = "Mã Voucher không được để trống")]
        [StringLength(50)]
        public string VoucherCode { get; set; } = string.Empty;

        [Range(1, 100, ErrorMessage = "Phần trăm giảm từ 1 đến 100%")]
        public int DiscountPercent { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal MaxDiscountAmount { get; set; } // Giảm tối đa bao nhiêu tiền

        [Column(TypeName = "decimal(18,2)")]
        public decimal MinOrderAmount { get; set; } // Đơn tối thiểu bao nhiêu thì được áp dụng

        public int UsageLimit { get; set; } // Tổng số lượt dùng của cả hệ thống
        public int MaxUsagePerUser { get; set; } // Một người được dùng mấy lần
        public int UsedCount { get; set; } = 0;

        public DateTime StartDate { get; set; } = DateTime.Now;
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; } = true;
    }
}