using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class UserAddress
    {
        [Key] public int Id { get; set; }
        public int UserId { get; set; }
        [ForeignKey("UserId")] public User User { get; set; }

        [Required, StringLength(100)] public string ReceiverName { get; set; } = string.Empty;
        [Required, StringLength(15)] public string PhoneNumber { get; set; } = string.Empty;
        [Required, StringLength(255)] public string DetailedAddress { get; set; } = string.Empty;

        [StringLength(50)] public string AddressType { get; set; } = "Nhà riêng";
        public bool IsDefault { get; set; } = false;
    }
}