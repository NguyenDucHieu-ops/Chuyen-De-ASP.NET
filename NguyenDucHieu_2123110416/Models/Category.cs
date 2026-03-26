using System.ComponentModel.DataAnnotations;

namespace NguyenDucHieu_2123110416.Models
{
    public class Category
    {
        [Key] public int Id { get; set; }
        [Required, StringLength(100)] public string CategoryName { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}