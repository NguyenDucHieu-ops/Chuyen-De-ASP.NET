using System.ComponentModel.DataAnnotations;

namespace NguyenDucHieu_2123110416.Models
{
    public class Role
    {
        [Key] public int Id { get; set; }
        [Required, StringLength(50)] public string RoleName { get; set; } = string.Empty;
        [StringLength(255)] public string Description { get; set; } = string.Empty;
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}