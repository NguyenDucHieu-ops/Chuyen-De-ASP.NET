using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;

        public OrderService(AppDbContext context)
        {
            _context = context;
        }

        // ====================================================================
        // HÀM TẠO ĐƠN HÀNG (DÀNH CHO KHÁCH)
        // ====================================================================
        public async Task<Order> CreateOrderAsync(int userId, int addressId, string? voucherCode, List<OrderDetail> cartItems, string note)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null || !user.IsActive) throw new Exception("Tài khoản không hợp lệ!");

                var address = await _context.UserAddresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);
                if (address == null) throw new Exception("Địa chỉ không hợp lệ!");

                var order = new Order
                {
                    UserId = userId,
                    AddressId = addressId,
                    OrderNote = note,
                    TotalAmount = 0,
                    DiscountAmount = 0,
                    FinalAmount = 0,
                    OrderStatus = "0", // Lưu kiểu string cho đồng bộ DB
                    CreatedAt = DateTime.Now
                };

                foreach (var item in cartItems)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null || !product.IsActive) throw new Exception($"Sản phẩm {item.ProductId} ngừng bán!");

                    decimal unitPrice = product.BasePrice;
                    decimal totalToppingPrice = 0;

                    if (product.HasOptions)
                    {
                        if (item.Size == "L") unitPrice += product.SizeUpPrice;
                        if (item.OrderDetailToppings != null)
                        {
                            foreach (var odt in item.OrderDetailToppings)
                            {
                                var topping = await _context.Toppings.FindAsync(odt.ToppingId);
                                if (topping != null && topping.IsActive)
                                {
                                    odt.ToppingPrice = topping.Price;
                                    totalToppingPrice += topping.Price;
                                }
                            }
                        }
                    }

                    item.UnitPrice = unitPrice;
                    item.TotalPrice = (unitPrice + totalToppingPrice) * item.Quantity;
                    order.TotalAmount += item.TotalPrice;
                    order.OrderDetails.Add(item);
                }

                if (!string.IsNullOrWhiteSpace(voucherCode))
                {
                    var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == voucherCode && v.IsActive);
                    if (voucher != null && voucher.ExpiryDate >= DateTime.Now)
                    {
                        order.VoucherId = voucher.Id;
                        order.DiscountAmount = Math.Min(voucher.DiscountAmount, order.TotalAmount);
                    }
                }

                order.FinalAmount = order.TotalAmount - order.DiscountAmount;

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return order;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ====================================================================
        // HÀM LẤY LỊCH SỬ ĐƠN (DÀNH CHO KHÁCH)
        // ====================================================================
        public async Task<List<Order>> GetUserOrdersAsync(int userId)
        {
            return await _context.Orders
                .Include(o => o.OrderDetails).ThenInclude(od => od.Product)
                .Include(o => o.OrderDetails).ThenInclude(od => od.OrderDetailToppings).ThenInclude(odt => odt.Topping)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        // ====================================================================
        // HÀM XỬ LÝ TRẠNG THÁI & TÍCH ĐIỂM (DÀNH CHO ADMIN)
        // ====================================================================
        public async Task UpdateOrderStatusAsync(int orderId, int status)
        {
            // 1. Tìm đơn hàng kèm thông tin khách để cộng điểm
            var order = await _context.Orders
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null) throw new Exception("Không thấy đơn hàng!");

            // 2. Cập nhật trạng thái
            order.OrderStatus = status.ToString();

            // 3. XỬ LÝ NGHIỆP VỤ KHI GIAO THÀNH CÔNG (Status = 2)
            if (status == 2)
            {
                // Tính điểm: Ví dụ 10.000đ được 1 điểm
                int earnedPoints = (int)(order.FinalAmount / 10000);

                if (earnedPoints > 0)
                {
                    // Cộng điểm trực tiếp cho User
                    order.User.LoyaltyPoints += earnedPoints;

                    // Ghi lịch sử giao dịch để trang "Giao Dịch & Điểm Thưởng" có dữ liệu
                    var transaction = new PointTransaction
                    {
                        UserId = order.UserId,
                        OrderId = order.Id,
                        Points = earnedPoints,
                        Description = $"Tích điểm từ đơn hàng #{order.Id} (Hoàn thành)",
                        CreatedAt = DateTime.Now
                    };
                    _context.PointTransactions.Add(transaction);
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}