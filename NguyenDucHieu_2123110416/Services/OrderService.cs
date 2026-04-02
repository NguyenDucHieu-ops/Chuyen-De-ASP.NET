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

        public async Task<Order> CreateOrderAsync(int userId, int addressId, string? voucherCode, List<OrderDetail> cartItems, string note)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Kiểm tra Người dùng & Địa chỉ
                var user = await _context.Users.FindAsync(userId);
                if (user == null || !user.IsActive) throw new Exception("Tài khoản không tồn tại hoặc bị khóa!");

                var address = await _context.UserAddresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);
                if (address == null) throw new Exception("Địa chỉ giao hàng không hợp lệ!");

                // 2. Khởi tạo Hóa đơn
                var order = new Order
                {
                    UserId = userId,
                    AddressId = addressId,
                    OrderNote = note,
                    TotalAmount = 0,
                    DiscountAmount = 0,
                    FinalAmount = 0
                };

                // 3. TÍNH TIỀN NGHIÊM NGẶT TỪ DATABASE
                foreach (var item in cartItems)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null || !product.IsActive) throw new Exception($"Sản phẩm ID {item.ProductId} đã ngừng bán!");

                    decimal unitPrice = product.BasePrice;
                    decimal totalToppingPrice = 0;

                    // Lỗ hổng 3: Chặn đứng hacker nhét Size L và Topping vào "Đồ ăn vặt"
                    if (!product.HasOptions)
                    {
                        item.Size = null;
                        item.IceLevel = null;
                        item.SugarLevel = null;
                        item.OrderDetailToppings.Clear(); // Xóa sạch topping nếu cố tình gửi lên
                    }
                    else
                    {
                        // Thức uống: Tính tiền Size L
                        if (item.Size == "L") unitPrice += product.SizeUpPrice;

                        // Tính tiền Topping
                        if (item.OrderDetailToppings.Any())
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

                // 4. XỬ LÝ VOUCHER KHẮT KHE & CHỐNG RACE CONDITION
                if (!string.IsNullOrWhiteSpace(voucherCode))
                {
                    var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.VoucherCode == voucherCode && v.IsActive);
                    if (voucher == null) throw new Exception("Mã giảm giá không tồn tại!");
                    if (voucher.EndDate < DateTime.Now) throw new Exception("Mã giảm giá đã hết hạn!");
                    if (order.TotalAmount < voucher.MinOrderAmount) throw new Exception($"Đơn hàng cần đạt tối thiểu {voucher.MinOrderAmount}đ!");
                    if (voucher.UsedCount >= voucher.UsageLimit) throw new Exception("Mã giảm giá đã hết số lượng phát hành!");

                    // Lỗ hổng 4: Kiểm tra giới hạn số lần dùng CỦA RIÊNG NGƯỜI DÙNG NÀY
                    var userUsageCount = await _context.Orders.CountAsync(o => o.UserId == userId && o.VoucherId == voucher.Id);
                    if (userUsageCount >= voucher.MaxUsagePerUser) throw new Exception($"Bạn chỉ được sử dụng mã này tối đa {voucher.MaxUsagePerUser} lần!");

                    decimal discount = order.TotalAmount * ((decimal)voucher.DiscountPercent / 100);
                    if (discount > voucher.MaxDiscountAmount) discount = voucher.MaxDiscountAmount;

                    order.VoucherId = voucher.Id;
                    order.DiscountAmount = discount;

                    voucher.UsedCount++;
                    _context.Vouchers.Update(voucher);
                }

                // 5. CHỐT TIỀN & CỘNG ĐIỂM LOYALTY (10.000đ = 1 điểm)
                order.FinalAmount = order.TotalAmount - order.DiscountAmount;

                int earnedPoints = (int)(order.FinalAmount / 10000);
                user.LoyaltyPoints += earnedPoints;
                _context.Users.Update(user);

                var pointTx = new PointTransaction
                {
                    UserId = userId,
                    Points = earnedPoints,
                    Description = $"Tích điểm từ Đơn hàng",
                    Order = order
                };
                _context.PointTransactions.Add(pointTx);

                // 6. Lưu xuống DB và chốt Transaction
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync(); // Xác nhận mọi thứ thành công 100%

                return order;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync(); // Nếu rớt mạng hoặc có lỗi, hoàn tác mọi thứ, không lưu rác vào DB
                throw;
            }
        }

        // ======================================================================
        // HÀM MỚI THÊM: LẤY LỊCH SỬ ĐƠN HÀNG (DÙNG INCLUDE ĐỂ MÓC NỐI DỮ LIỆU)
        // ======================================================================
        public async Task<List<Order>> GetUserOrdersAsync(int userId)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderDetails) // Lấy danh sách món ăn
                    .ThenInclude(od => od.Product) // Lấy thông tin ly trà sữa
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.OrderDetailToppings) // Lấy danh sách topping của món đó
                        .ThenInclude(odt => odt.Topping) // Lấy tên topping
                .Include(o => o.Voucher) // Lấy thông tin mã giảm giá (nếu có)
                .Where(o => o.UserId == userId) // Chỉ lấy đơn của ông khách này
                .OrderByDescending(o => o.CreatedAt) // Đơn mới nhất xếp lên đầu
                .ToListAsync();

            return orders;
        }
        // ======================================================================
        // HÀM MỚI THÊM: CẬP NHẬT TRẠNG THÁI (DÀNH CHO ADMIN)
        // ======================================================================
        public async Task UpdateOrderStatusAsync(int orderId, string status)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) throw new Exception("Không tìm thấy đơn hàng");

            order.OrderStatus = status;

            // NGHIỆP VỤ VIP: Nếu đơn hàng hoàn thành, tặng điểm thưởng (1000đ = 1 điểm)
            if (status == "Completed")
            {
                int pointsToAdd = (int)(order.FinalAmount / 1000);

                var pointTrans = new PointTransaction
                {
                    UserId = order.UserId,
                    OrderId = order.Id,
                    Points = pointsToAdd,
                    Description = $"Tặng điểm tri ân cho đơn hàng #{order.Id}",
                    CreatedAt = DateTime.Now
                };

                _context.PointTransactions.Add(pointTrans);

                // Cập nhật vào tổng điểm tích lũy của User
                var user = await _context.Users.FindAsync(order.UserId);
                if (user != null)
                {
                    user.LoyaltyPoints += pointsToAdd; // Phải khớp với cột trong Model User
                    _context.Users.Update(user);
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}