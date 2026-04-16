using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;
using NguyenDucHieu_2123110416.Services; // Nhớ tạo file VnPayLibrary trong thư mục Services

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public PaymentsController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // ========================================================
        // 🚀 LOGIC VNPAY: TẠO URL THANH TOÁN
        // ========================================================
        [HttpGet("create-vnpay-url/{orderId}")]
        public async Task<IActionResult> CreatePaymentUrl(int orderId, [FromQuery] double amount)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return NotFound("Không tìm thấy đơn hàng!");

            var vnpay = new VnPayLibrary();
            var vnp_Params = _config.GetSection("Vnpay");

            // Nạp dữ liệu theo chuẩn VNPAY
            vnpay.AddRequestData("vnp_Version", "2.1.0");
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", vnp_Params["TmnCode"]);
            vnpay.AddRequestData("vnp_Amount", (amount * 100).ToString()); // VNPAY yêu cầu số tiền * 100
            vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", "VND");
            vnpay.AddRequestData("vnp_IpAddr", HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1");
            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_OrderInfo", "Thanh toan don hang HieuStore: " + orderId);
            vnpay.AddRequestData("vnp_OrderType", "other");
            vnpay.AddRequestData("vnp_ReturnUrl", vnp_Params["ReturnUrl"]);
            vnpay.AddRequestData("vnp_TxnRef", orderId.ToString() + "_" + DateTime.Now.Ticks); // Mã giao dịch duy nhất

            string paymentUrl = vnpay.CreateRequestUrl(vnp_Params["BaseUrl"], vnp_Params["HashSecret"]);

            return Ok(new { url = paymentUrl });
        }

        // ========================================================
        // 🛠️ CÁC HÀM CRUD CŨ CỦA HIẾU (GIỮ NGUYÊN 100%)
        // ========================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPayments() => await _context.Payments.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Payment>> GetPayment(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null) return NotFound();
            return payment;
        }

        [HttpPost]
        public async Task<ActionResult<Payment>> PostPayment(Payment payment)
        {
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetPayment", new { id = payment.Id }, payment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPayment(int id, Payment payment)
        {
            if (id != payment.Id) return BadRequest("ID không khớp!");
            _context.Entry(payment).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null) return NotFound();
            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("multiple")]
        public async Task<IActionResult> DeleteMultiplePayments([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");
            var idList = ids.Split(',').Select(i => i.Trim()).Where(i => int.TryParse(i, out _)).Select(int.Parse).ToList();
            var listToDelete = await _context.Payments.Where(x => idList.Contains(x.Id)).ToListAsync();
            if (!listToDelete.Any()) return NotFound("Không tìm thấy dữ liệu để xóa!");

            _context.Payments.RemoveRange(listToDelete);
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa thành công {listToDelete.Count} giao dịch!" });
        }
    }
}