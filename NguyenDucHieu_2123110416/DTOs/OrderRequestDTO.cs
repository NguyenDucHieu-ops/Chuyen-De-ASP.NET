using System.ComponentModel.DataAnnotations;

namespace NguyenDucHieu_2123110416.DTOs
{
    // Cục dữ liệu hứng từ Swagger/Frontend gửi lên
    public class OrderRequestDTO
    {
        // ĐÃ XÓA USERID Ở ĐÂY ĐỂ BẢO MẬT TUYỆT ĐỐI
        [Required] public int AddressId { get; set; }

        public string? VoucherCode { get; set; }
        public string? Note { get; set; }

        [Required]
        // Bắt buộc phải có danh sách món ăn
        public List<OrderItemDTO> Items { get; set; } = new List<OrderItemDTO>();
    }

    // Cấu trúc của từng món ăn trong giỏ
    public class OrderItemDTO
    {
        [Required] public int ProductId { get; set; }

        [Range(1, 100, ErrorMessage = "Số lượng phải lớn hơn 0 và tối đa 100!")]
        public int Quantity { get; set; }

        public string? Size { get; set; }

        public List<int> ToppingIds { get; set; } = new List<int>();
    }

    public class UpdateOrderStatusDTO
    {
        [Required]
        public string Status { get; set; } = null!;
    }
}