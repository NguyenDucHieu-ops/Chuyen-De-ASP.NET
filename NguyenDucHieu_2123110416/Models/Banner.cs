using System.ComponentModel.DataAnnotations;

namespace NguyenDucHieu_2123110416.Models
{
    public class Banner : BaseAuditEntity
    {
        [Key] public int Id { get; set; }
        [Required] public string ImageUrl { get; set; } = string.Empty;
        [StringLength(100)] public string Title { get; set; } = string.Empty;
        public string LinkUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}