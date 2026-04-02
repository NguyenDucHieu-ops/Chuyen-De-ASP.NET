using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    // Kế thừa BaseAuditEntity để có 7 cột theo dõi (CreatedAt, CreatedBy,...)
    public class Topping : BaseAuditEntity
    {
        [Key] public int Id { get; set; }

        [Required(ErrorMessage = "Tên Topping không được để trống")]
        [StringLength(100)]
        public string ToppingName { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public bool IsActive { get; set; } = true;
    }
}