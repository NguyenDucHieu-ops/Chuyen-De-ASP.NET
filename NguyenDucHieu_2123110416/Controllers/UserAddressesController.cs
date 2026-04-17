using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;
using System.Security.Claims;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserAddressesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public UserAddressesController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserAddress>>> GetUserAddresses()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            if (userRole == "Admin") return await _context.UserAddresses.Include(u => u.User).ToListAsync();
            return await _context.UserAddresses.Where(a => a.UserId == userId).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserAddress>> GetUserAddress(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var address = await _context.UserAddresses.Include(u => u.User).FirstOrDefaultAsync(u => u.Id == id);
            if (address == null) return NotFound();
            if (address.UserId != userId && userRole != "Admin") return Forbid();

            return address;
        }

        [HttpPost]
        public async Task<ActionResult<UserAddress>> PostUserAddress(UserAddress userAddress)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            userAddress.UserId = userId; // Ép buộc ID từ Token để tránh hack địa chỉ người khác

            _context.UserAddresses.Add(userAddress);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetUserAddress", new { id = userAddress.Id }, userAddress);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserAddress(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var address = await _context.UserAddresses.FindAsync(id);
            if (address == null) return NotFound();
            if (address.UserId != userId) return Forbid();

            _context.UserAddresses.Remove(address);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}