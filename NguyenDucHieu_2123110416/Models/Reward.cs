using System.ComponentModel.DataAnnotations;

namespace NguyenDucHieu_2123110416.Models
{
    public class Reward : BaseAuditEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Type { get; set; } = null!; // "VOUCHER", "POINTS", "LUCK_NEXT_TIME"

        public int Value { get; set; } // Nếu là VOUCHER thì lưu số tiền, POINTS thì lưu điểm

        public double Probability { get; set; } // Tỉ lệ trúng (ví dụ: 0.2 = 20%)

        public bool IsActive { get; set; } = true;
    }
}