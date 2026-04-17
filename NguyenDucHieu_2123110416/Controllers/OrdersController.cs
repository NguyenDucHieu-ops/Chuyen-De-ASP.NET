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
        // 1. ADMIN: LẤY TOÀN BỘ ĐƠN HÀNG (GIỮ NGUYÊN)
        // ====================================================
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.User)
                    .OrderByDescending(o => o.CreatedAt)
                    .Select(o => new {
                        id = o.Id,
                        customerName = o.User.FullName,
                        phone = o.User.PhoneNumber,
                        totalAmount = o.FinalAmount,
                        status = o.OrderStatus,
                        createdAt = o.CreatedAt
                    })
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        // ====================================================
        // 2. ADMIN: XEM CHI TIẾT ĐƠN HÀNG (GIỮ NGUYÊN)
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
                    customerName = order.User.FullName,
                    phone = order.User.PhoneNumber,
                    address = "Giao hàng tận nơi",
                    totalAmount = order.FinalAmount,
                    status = order.OrderStatus,
                    createdAt = order.CreatedAt,
                    orderDetails = order.OrderDetails.Select(od => new {
                        productName = od.Product.ProductName,
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
        // 3. ADMIN: CẬP NHẬT TRẠNG THÁI (GIỮ NGUYÊN)
        // ====================================================
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] int status)
        {
            try
            {
                var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(adminIdString)) return Unauthorized();

                await _orderService.UpdateOrderStatusAsync(id, status);

                var order = await _context.Orders.FindAsync(id);
                if (order != null)
                {
                    order.UpdatedBy = int.Parse(adminIdString);
                    order.UpdatedAt = DateTime.Now;
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Cập nhật trạng thái thành công!" });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        // ====================================================
        // 4. DÀNH CHO KHÁCH HÀNG: ĐẶT HÀNG (FIXED: ĐÃ THÊM LOGIC LƯU)
        // ====================================================
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] OrderRequestDTO request)
        {
            try
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdString)) return Unauthorized(new { error = "Hết hạn đăng nhập!" });

                int currentUserId = int.Parse(userIdString);

                // Chuyển DTO sang danh sách OrderDetail
                var orderDetails = request.Items.Select(item => new OrderDetail
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Size = item.Size,
                    OrderDetailToppings = item.ToppingIds.Select(id => new OrderDetailTopping { ToppingId = id }).ToList()
                }).ToList();

                // Gọi Service để thực hiện lưu đơn vào Database
                var order = await _orderService.CreateOrderAsync(currentUserId, request.AddressId, request.VoucherCode, orderDetails, request.Note ?? string.Empty);

                return Ok(new { message = "Đặt hàng thành công!", orderId = order.Id, finalAmount = order.FinalAmount });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        // ====================================================
        // 5. DÀNH CHO KHÁCH HÀNG: XEM LỊCH SỬ (FIXED: ĐÃ THÊM LOGIC LẤY DỮ LIỆU)
        // ====================================================
        [HttpGet("history")]
        public async Task<IActionResult> GetOrderHistory()
        {
            try
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

                var orders = await _orderService.GetUserOrdersAsync(int.Parse(userIdString));
                return Ok(orders);
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }
    }
}