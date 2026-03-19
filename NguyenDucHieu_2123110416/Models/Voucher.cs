using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class Voucher
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string VoucherCode { get; set; } = string.Empty;

        public int DiscountPercent { get; set; } // Giảm bao nhiêu phần trăm (VD: 20%)

        [Column(TypeName = "decimal(18,2)")]
        public decimal MaxDiscountAmount { get; set; } // Giảm tối đa bao nhiêu tiền (VD: 50.000đ)

        [Column(TypeName = "decimal(18,2)")]
        public decimal MinOrderAmount { get; set; } // Đơn tối thiểu để áp dụng

        public DateTime ExpiryDate { get; set; } // Ngày hết hạn

        public int UsageLimit { get; set; } // Giới hạn số lần sử dụng

        public bool IsActive { get; set; } = true;
    }
}