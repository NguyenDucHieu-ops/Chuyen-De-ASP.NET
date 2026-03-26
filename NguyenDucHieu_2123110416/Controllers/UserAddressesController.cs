using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserAddressesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserAddressesController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserAddress>>> GetUserAddresses() => await _context.UserAddresses.Include(u => u.User).ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<UserAddress>> GetUserAddress(int id)
        {
            var userAddress = await _context.UserAddresses.Include(u => u.User).FirstOrDefaultAsync(u => u.Id == id);
            if (userAddress == null) return NotFound();
            return userAddress;
        }

        [HttpPost]
        public async Task<ActionResult<UserAddress>> PostUserAddress(UserAddress userAddress)
        {
            _context.UserAddresses.Add(userAddress);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetUserAddress", new { id = userAddress.Id }, userAddress);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutUserAddress(int id, UserAddress userAddress)
        {
            if (id != userAddress.Id) return BadRequest("ID không khớp!");
            _context.Entry(userAddress).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserAddress(int id)
        {
            var userAddress = await _context.UserAddresses.FindAsync(id);
            if (userAddress == null) return NotFound();
            _context.UserAddresses.Remove(userAddress);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("multiple")]
        public async Task<IActionResult> DeleteMultipleUserAddresses([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");
            var idList = ids.Split(',').Select(i => i.Trim()).Where(i => int.TryParse(i, out _)).Select(int.Parse).ToList();
            var listToDelete = await _context.UserAddresses.Where(x => idList.Contains(x.Id)).ToListAsync();
            if (!listToDelete.Any()) return NotFound("Không tìm thấy dữ liệu để xóa!");

            _context.UserAddresses.RemoveRange(listToDelete);
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa thành công {listToDelete.Count} địa chỉ!" });
        }
    }
}