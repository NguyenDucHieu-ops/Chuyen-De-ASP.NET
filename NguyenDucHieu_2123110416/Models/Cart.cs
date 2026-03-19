using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class Cart
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        // 1 Giỏ hàng có nhiều món bên trong
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}