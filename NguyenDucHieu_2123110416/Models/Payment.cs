using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class Payment
    {
        [Key] public int Id { get; set; }
        public int OrderId { get; set; }
        [ForeignKey("OrderId")] public Order Order { get; set; }

        [StringLength(50)] public string PaymentMethod { get; set; } = string.Empty;
        [StringLength(100)] public string TransactionNo { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")] public decimal Amount { get; set; }
        [StringLength(50)] public string PaymentStatus { get; set; } = "Pending";

        public DateTime PaymentDate { get; set; } = DateTime.Now;
    }
}