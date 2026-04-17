using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Services
{
    public interface IOrderService
    {
        Task<Order> CreateOrderAsync(int userId, int addressId, string? voucherCode, List<OrderDetail> cartItems, string note);
        Task<List<Order>> GetUserOrdersAsync(int userId);
        // Dùng int cho status để khớp với Controller và React
        Task UpdateOrderStatusAsync(int orderId, int status);
    }
}