using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class Voucher
    {
        [Key] public int Id { get; set; }
        [Required, StringLength(50)] public string VoucherCode { get; set; } = string.Empty;

        public int DiscountPercent { get; set; }
        [Column(TypeName = "decimal(18,2)")] public decimal MaxDiscountAmount { get; set; }
        [Column(TypeName = "decimal(18,2)")] public decimal MinOrderAmount { get; set; }

        public int UsageLimit { get; set; }
        public int MaxUsagePerUser { get; set; }
        public int UsedCount { get; set; } = 0;

        public DateTime StartDate { get; set; } = DateTime.Now;
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;
    }
}