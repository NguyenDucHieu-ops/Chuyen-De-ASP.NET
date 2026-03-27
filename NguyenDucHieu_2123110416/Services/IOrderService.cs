using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Services
{
    // Chữ I đứng đầu đại diện cho Interface
    public interface IOrderService
    {
        // Hàm này sẽ nhận vào thông tin khách đặt và trả về Hóa đơn hoàn chỉnh
        Task<Order> CreateOrderAsync(int userId, int addressId, string? voucherCode, List<OrderDetail> cartItems, string note);
        Task<List<Order>> GetUserOrdersAsync(int userId);
        // DÀNH CHO ADMIN: Cập nhật trạng thái đơn hàng
        Task<bool> UpdateOrderStatusAsync(int orderId, string newStatus);
    }
}