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
        // HÀM TẠO ĐƠN HÀNG (DÀNH CHO KHÁCH) - ĐÃ CẬP NHẬT TÍNH SHIP & ĐIỂM
        // ====================================================================
        public async Task<Order> CreateOrderAsync(int userId, int addressId, string? voucherCode, List<OrderDetail> cartItems, string note, decimal shippingFee, int usedPoints)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null || !user.IsActive) throw new Exception("Tài khoản không hợp lệ!");

                // Không bắt lỗi addressId == null nếu khách nhập tay (tuỳ sếp, tạm thời tắt check cứng)
                // var address = await _context.UserAddresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);
                // if (address == null) throw new Exception("Địa chỉ không hợp lệ!");

                var order = new Order
                {
                    UserId = userId,
                    AddressId = addressId, // Vẫn lưu ID, hoặc 1 nếu là khách nhập tay
                    OrderNote = note,
                    TotalAmount = 0,     // Tổng tiền hàng
                    DiscountAmount = 0,  // Tiền trừ do Voucher
                    FinalAmount = 0,     // Tiền khách phải trả
                    OrderStatus = "0",
                    CreatedAt = DateTime.Now
                };

                // 1. TÍNH TIỀN HÀNG + TOPPING
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

                // 2. CỘNG TIỀN SHIP VÀO TỔNG TIỀN GỐC
                order.TotalAmount += shippingFee;

                // 3. TRỪ TIỀN VOUCHER
                if (!string.IsNullOrWhiteSpace(voucherCode))
                {
                    var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == voucherCode && v.IsActive);
                    if (voucher != null && voucher.ExpiryDate >= DateTime.Now)
                    {
                        order.VoucherId = voucher.Id;
                        // Chỉ giảm tối đa bằng tổng tiền hàng (không tính ship)
                        order.DiscountAmount = Math.Min(voucher.DiscountAmount, (order.TotalAmount - shippingFee));
                    }
                }

                // 4. TRỪ TIỀN ĐIỂM (1 điểm = 1000đ)
                decimal pointsDiscountValue = usedPoints * 1000;

                // 5. CHỐT SỐ TIỀN CUỐI CÙNG (Không được < 0)
                order.FinalAmount = order.TotalAmount - order.DiscountAmount - pointsDiscountValue;
                if (order.FinalAmount < 0) order.FinalAmount = 0;

                _context.Orders.Add(order);
                await _context.SaveChangesAsync(); // Cần Save trước để lấy order.Id

                // 6. GHI NHẬT KÝ TRỪ ĐIỂM VÀO BẢNG POINT TRANSACTIONS
                if (usedPoints > 0)
                {
                    var pointTransaction = new PointTransaction
                    {
                        UserId = userId,
                        OrderId = order.Id,
                        Points = -usedPoints, // SỐ ÂM ĐỂ TRỪ ĐIỂM TRONG LỊCH SỬ
                        Description = $"Sử dụng {usedPoints} điểm cho đơn hàng #{order.Id}",
                        CreatedAt = DateTime.Now,
                        CreatedBy = userId
                    };
                    _context.PointTransactions.Add(pointTransaction);
                    await _context.SaveChangesAsync();
                }

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
            // Logic cũ của sếp tui để nguyên vì ở OrdersController đã xử lý cộng điểm rồi.
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) throw new Exception("Không thấy đơn hàng!");

            order.OrderStatus = status.ToString();
            await _context.SaveChangesAsync();
        }
    }
}