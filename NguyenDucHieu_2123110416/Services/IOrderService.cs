using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Services
{
    public interface IOrderService
    {
        // 💡 THÊM THAM SỐ shippingFee VÀ usedPoints VÀO ĐÂY
        Task<Order> CreateOrderAsync(int userId, int addressId, string? voucherCode, List<OrderDetail> cartItems, string note, decimal shippingFee, int usedPoints);

        Task<List<Order>> GetUserOrdersAsync(int userId);
        Task UpdateOrderStatusAsync(int orderId, int status);
    }
}