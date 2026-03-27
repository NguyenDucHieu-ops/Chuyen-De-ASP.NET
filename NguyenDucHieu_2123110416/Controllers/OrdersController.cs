using Microsoft.AspNetCore.Mvc;
using NguyenDucHieu_2123110416.Data; 
using NguyenDucHieu_2123110416.DTOs;
using NguyenDucHieu_2123110416.Models;
using NguyenDucHieu_2123110416.Services;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        // Bơm (Inject) cái Service xịn xò vào Controller
        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] OrderRequestDTO request)
        {
            try
            {
                // 1. Chuyển đổi dữ liệu từ DTO sang Models để nhét vào Service
                var orderDetails = new List<OrderDetail>();
                foreach (var item in request.Items)
                {
                    var detail = new OrderDetail
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        Size = item.Size,
                        // Biến danh sách số nguyên (1,2) thành danh sách Topping thật
                        OrderDetailToppings = item.ToppingIds.Select(id => new OrderDetailTopping { ToppingId = id }).ToList()
                    };
                    orderDetails.Add(detail);
                }

                // 2. Gọi Service xử lý tính tiền, voucher, điểm thưởng...
                var order = await _orderService.CreateOrderAsync(
                    request.UserId,
                    request.AddressId,
                    request.VoucherCode,
                    orderDetails,
                    request.Note ?? string.Empty
                );

                // 3. Trả kết quả thành công
                return Ok(new
                {
                    message = "Đặt hàng thành công!",
                    orderId = order.Id,
                    finalAmount = order.FinalAmount
                });
            }
            catch (Exception ex)
            {
                // Nếu Service phát hiện gian lận hoặc lỗi (hết mã, sai user), quăng lỗi 400 ra đây
                return BadRequest(new { error = ex.Message });
            }
        }
        // ==========================================================
        // API NÀY DÙNG ĐỂ KHÁCH HÀNG XEM LẠI LỊCH SỬ ĐƠN HÀNG CỦA MÌNH
        // ==========================================================
        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetOrderHistory(int userId)
        {
            try
            {
                var orders = await _orderService.GetUserOrdersAsync(userId);

                if (orders == null || !orders.Any())
                    return NotFound(new { message = "Bạn chưa có đơn hàng nào." });

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        // ==========================================================
        // API DÀNH CHO ADMIN: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
        // ==========================================================
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDTO request)
        {
            try
            {
                await _orderService.UpdateOrderStatusAsync(id, request.Status);
                return Ok(new { message = $"Đã cập nhật đơn hàng #{id} sang trạng thái: {request.Status}" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        // ==========================================================
        // API NÀY DÙNG ĐỂ TẠO NHANH DỮ LIỆU MẪU ĐỂ TEST ĐẶT HÀNG
        // ==========================================================
        [HttpPost("seed-data-test")]
        public async Task<IActionResult> SeedDataTest([FromServices] AppDbContext context)
        {
            // 1. Tạo Quyền (Role)
            var role = new Role { RoleName = "Customer", Description = "Khách mua hàng" };
            context.Roles.Add(role);
            await context.SaveChangesAsync();

            // 2. Tạo Người dùng (User) có ID = 1
            var user = new User
            {
                RoleId = role.Id,
                FullName = "Nguyễn Đức Hiếu",
                Email = "hieu@gmail.com",
                PasswordHash = "123456",
                PhoneNumber = "0123456789"
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            // 3. Tạo Địa chỉ (UserAddress) có ID = 1
            var address = new UserAddress
            {
                UserId = user.Id,
                ReceiverName = "Hiếu",
                PhoneNumber = "0123456789",
                DetailedAddress = "Ký túc xá CĐ Công Thương"
            };
            context.UserAddresses.Add(address);

            // 4. Tạo Topping (Trân châu trắng) có ID = 1
            var topping = new Topping { ToppingName = "Trân châu trắng", Price = 10000 };
            context.Toppings.Add(topping);

            await context.SaveChangesAsync();

            return Ok("Đã tạo sẵn Role, User ID=1, Address ID=1 và Topping ID=1 thành công! Giờ hãy quay lại test Checkout đi!");
        }
    }
}