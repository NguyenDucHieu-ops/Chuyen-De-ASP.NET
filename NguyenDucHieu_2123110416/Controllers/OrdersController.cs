using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.DTOs;
using NguyenDucHieu_2123110416.Models;
using NguyenDucHieu_2123110416.Services;
using System.Security.Claims;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly AppDbContext _context;

        public OrdersController(IOrderService orderService, AppDbContext context)
        {
            _orderService = orderService;
            _context = context;
        }

        // ====================================================
        // 1. ADMIN: LẤY TOÀN BỘ ĐƠN HÀNG 
        // ====================================================
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderDetails).ThenInclude(od => od.Product)
                    .OrderByDescending(o => o.CreatedAt)
                    .Select(o => new {
                        id = o.Id,
                        customerName = o.User != null ? o.User.FullName : "Khách ẩn danh",
                        phone = o.User != null ? o.User.PhoneNumber : "",
                        totalAmount = o.FinalAmount,
                        status = o.OrderStatus,
                        createdAt = o.CreatedAt,
                        productSummary = string.Join(", ", o.OrderDetails.Select(od => od.Product.ProductName + " (x" + od.Quantity + ")"))
                    })
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        // ====================================================
        // 2. ADMIN: XEM CHI TIẾT ĐƠN HÀNG 
        // ====================================================
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetOrderDetail(int id)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderDetails).ThenInclude(od => od.Product)
                    .Include(o => o.OrderDetails).ThenInclude(od => od.OrderDetailToppings).ThenInclude(odt => odt.Topping)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null) return NotFound("Không thấy đơn hàng!");

                var result = new
                {
                    id = order.Id,
                    customerName = order.User != null ? order.User.FullName : "Khách ẩn danh",
                    phone = order.User != null ? order.User.PhoneNumber : "",
                    address = "Giao hàng tận nơi",
                    totalAmount = order.FinalAmount,
                    status = order.OrderStatus,
                    createdAt = order.CreatedAt,
                    orderDetails = order.OrderDetails.Select(od => new {
                        productName = od.Product.ProductName,
                        productId = od.ProductId,
                        size = od.Size,
                        quantity = od.Quantity,
                        unitPrice = od.UnitPrice,
                        toppingNames = string.Join(", ", od.OrderDetailToppings.Select(t => t.Topping.ToppingName))
                    })
                };

                return Ok(result);
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        // ====================================================
        // 3. ADMIN: CẬP NHẬT TRẠNG THÁI (CỘNG ĐIỂM KHI XONG)
        // ====================================================
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            try
            {
                var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(adminIdString)) return Unauthorized();

                await _orderService.UpdateOrderStatusAsync(id, int.Parse(status));

                var order = await _context.Orders.FindAsync(id);
                if (order != null)
                {
                    order.UpdatedBy = int.Parse(adminIdString);
                    order.UpdatedAt = DateTime.Now;

                    // Nếu đơn hàng thành công (Status 2) -> Cộng điểm cho khách
                    if (status == "2" || order.OrderStatus.ToString() == "2" || order.OrderStatus.ToString() == "Completed")
                    {
                        bool alreadyRewarded = await _context.PointTransactions.AnyAsync(pt => pt.OrderId == id && pt.Points > 0);
                        if (!alreadyRewarded)
                        {
                            // Tỷ lệ: 10.000đ = 1 Điểm
                            int pointsEarned = (int)(order.FinalAmount / 10000);
                            if (pointsEarned > 0)
                            {
                                _context.PointTransactions.Add(new PointTransaction
                                {
                                    UserId = order.UserId,
                                    OrderId = order.Id,
                                    Points = pointsEarned,
                                    Description = $"Tích điểm đơn hàng #HIEU-{order.Id}",
                                    CreatedAt = DateTime.Now,
                                    CreatedBy = int.Parse(adminIdString)
                                });
                            }
                        }
                    }
                    await _context.SaveChangesAsync();
                }
                return Ok(new { message = "Cập nhật trạng thái thành công!" });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        // ====================================================
        // 4. KHÁCH HÀNG: ĐẶT HÀNG (TRỪ ĐIỂM GIẢM TIỀN)
        // ====================================================
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] OrderRequestDTO request)
        {
            try
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdString)) return Unauthorized(new { error = "Hết hạn đăng nhập!" });

                int currentUserId = int.Parse(userIdString);

                // 💡 Kiểm tra điểm khách đang có nếu khách yêu cầu dùng điểm
                if (request.UsedPoints > 0)
                {
                    var userPoints = await _context.PointTransactions
                        .Where(pt => pt.UserId == currentUserId && pt.IsDeleted == false)
                        .SumAsync(pt => pt.Points);

                    if (userPoints < request.UsedPoints)
                        return BadRequest(new { error = "Sếp không đủ điểm để thực hiện giao dịch này!" });
                }

                // Chuyển DTO sang danh sách OrderDetail
                var orderDetails = request.Items.Select(item => new OrderDetail
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Size = item.Size,
                    OrderDetailToppings = item.ToppingIds.Select(id => new OrderDetailTopping { ToppingId = id }).ToList()
                }).ToList();

                // 💡 Gọi Service: Truyền thêm UsedPoints để tính giảm giá trong OrderService
                var order = await _orderService.CreateOrderAsync(currentUserId, request.AddressId, request.VoucherCode, orderDetails, request.Note ?? string.Empty);

                // 💡 Nếu có dùng điểm -> Trừ trực tiếp vào bảng giao dịch (Số điểm âm)
                if (request.UsedPoints > 0)
                {
                    // Giả sử 1 điểm = 1.000đ, ta trừ FinalAmount của đơn hàng ngay tại đây
                    // (Hoặc sếp nên xử lý trừ FinalAmount bên trong CreateOrderAsync của IOrderService để chuẩn nhất)

                    _context.PointTransactions.Add(new PointTransaction
                    {
                        UserId = currentUserId,
                        OrderId = order.Id,
                        Points = -request.UsedPoints, // 💡 SỐ ÂM ĐỂ TRỪ ĐIỂM
                        Description = $"Sử dụng {request.UsedPoints} điểm cho đơn hàng #{order.Id}",
                        CreatedAt = DateTime.Now,
                        CreatedBy = currentUserId
                    });

                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Đặt hàng thành công!", orderId = order.Id, finalAmount = order.FinalAmount });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        // ====================================================
        // 5. KHÁCH HÀNG: XEM LỊCH SỬ
        // ====================================================
        [HttpGet("history")]
        public async Task<IActionResult> GetOrderHistory()
        {
            try
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
                int userId = int.Parse(userIdString);

                var orders = await _context.Orders
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.CreatedAt)
                    .Select(o => new {
                        id = o.Id,
                        finalAmount = o.FinalAmount,
                        orderStatus = o.OrderStatus,
                        createdAt = o.CreatedAt,
                        updatedAt = o.UpdatedAt,
                        isReviewed = _context.Reviews.Any(r => r.OrderId == o.Id && !r.IsDeleted),
                        orderDetails = o.OrderDetails.Select(od => new {
                            productName = od.Product.ProductName,
                            productId = od.ProductId
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }
    }

    public class OrderRequestDTO
    {
        public int AddressId { get; set; }
        public string? VoucherCode { get; set; }
        public int UsedPoints { get; set; } // 💡 TRƯỜNG MỚI ĐỂ NHẬN ĐIỂM TỪ REACT
        public string? Note { get; set; }
        public List<OrderItemDTO> Items { get; set; } = new();
    }

    public class OrderItemDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string Size { get; set; } = "M";
        public List<int> ToppingIds { get; set; } = new();
    }
}