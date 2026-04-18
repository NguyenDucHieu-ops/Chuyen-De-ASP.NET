using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class User
    {
        [Key] public int Id { get; set; }
        public int RoleId { get; set; }
        [ForeignKey("RoleId")] public Role Role { get; set; }

        [Required, StringLength(100)] public string FullName { get; set; } = string.Empty;
        [Required, StringLength(100)] public string Email { get; set; } = string.Empty;
        [Required] public string PasswordHash { get; set; } = string.Empty;
        [StringLength(15)] public string PhoneNumber { get; set; } = string.Empty;
        public string? Address { get; set; } 
        public int LoyaltyPoints { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}