using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class PointTransaction : BaseAuditEntity // <--- Kế thừa vào đây
    {
        [Key] public int Id { get; set; }
        public int UserId { get; set; }
        [ForeignKey("UserId")] public virtual User? User { get; set; }

        public int? OrderId { get; set; }
        [ForeignKey("OrderId")] public virtual Order? Order { get; set; }

        public int Points { get; set; }
        [StringLength(255)] public string Description { get; set; } = string.Empty;
    }
}