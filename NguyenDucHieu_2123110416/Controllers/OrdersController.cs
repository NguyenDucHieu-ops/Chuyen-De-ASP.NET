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
        private readonly AppDbContext _context; // Đã thêm

        public OrdersController(IOrderService orderService, AppDbContext context) // Đã sửa constructor
        {
            _orderService = orderService;
            _context = context;
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] OrderRequestDTO request)
        {
            try
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdString))
                    return Unauthorized(new { error = "Token không hợp lệ!" });

                int currentUserId = int.Parse(userIdString);

                var orderDetails = request.Items.Select(item => new OrderDetail
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Size = item.Size,
                    OrderDetailToppings = item.ToppingIds.Select(id => new OrderDetailTopping { ToppingId = id }).ToList()
                }).ToList();

                var order = await _orderService.CreateOrderAsync(currentUserId, request.AddressId, request.VoucherCode, orderDetails, request.Note ?? string.Empty);

                return Ok(new { message = "Đặt hàng thành công!", orderId = order.Id, finalAmount = order.FinalAmount });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

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

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDTO request)
        {
            try
            {
                var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(adminIdString)) return Unauthorized();
                int adminId = int.Parse(adminIdString);

                await _orderService.UpdateOrderStatusAsync(id, request.Status);

                var order = await _context.Orders.FindAsync(id);
                if (order != null)
                {
                    order.UpdatedBy = adminId;
                    order.UpdatedAt = DateTime.Now;
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = $"Đã cập nhật đơn hàng #{id} sang trạng thái: {request.Status}" });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpPost("seed-data-test")]
        [AllowAnonymous]
        public async Task<IActionResult> SeedDataTest([FromServices] AppDbContext context)
        {
            // Code seed data cũ của bạn...
            return Ok("Đã tạo dữ liệu mẫu thành công!");
        }
    }
}