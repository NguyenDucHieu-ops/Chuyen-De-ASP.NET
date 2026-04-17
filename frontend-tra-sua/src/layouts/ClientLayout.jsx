import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ClientLayout = () => {
  const navigate = useNavigate();
  
  // FIX LỖI "Cascading Renders": Khởi tạo state bằng hàm để lấy dữ liệu ngay lần render đầu tiên
  const [cartCount, setCartCount] = useState(() => {
    const saved = localStorage.getItem('hieu_cart');
    const cart = saved ? JSON.parse(saved) : [];
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  });

  const token = localStorage.getItem('hieu_store_token');

  const updateCart = () => {
    const saved = localStorage.getItem('hieu_cart');
    const cart = saved ? JSON.parse(saved) : [];
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  };

  useEffect(() => {
    window.addEventListener('storage', updateCart);
    return () => window.removeEventListener('storage', updateCart);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Bạn muốn đăng xuất khỏi HieuStore?")) {
      localStorage.removeItem('hieu_store_token');
      navigate('/login'); // Đã dùng navigate ở đây để hết lỗi gạch đỏ
    }
  };

  const isAdmin = () => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role) === 'Admin';
    } catch { return false; }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-sans flex flex-col text-gray-900">
      {/* HEADER NỔI (STICKY GLASS) */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:rotate-12 transition-all duration-300">🧋</div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">Hieu<span className="text-indigo-600">Store</span></span>
          </Link>
          
          <nav className="flex gap-10 items-center">
            <Link to="/" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors">Thực đơn</Link>
            <Link to="/contact" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors">Liên hệ</Link>
            
            <Link to="/cart" className="relative group p-2">
              <span className="text-2xl transition-transform group-hover:scale-110 block">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black shadow-lg animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="w-px h-6 bg-gray-200"></div>

            {token ? (
              <div className="flex items-center gap-4">
                {isAdmin() && (
                  <Link to="/admin" className="text-[10px] font-black uppercase text-indigo-600 underline">Quản trị</Link>
                )}
                <Link to="/profile" className="w-10 h-10 rounded-full border-2 border-indigo-600 p-0.5 shadow-md hover:scale-105 transition-transform">
                   <img src="https://ui-avatars.com/api/?name=Hieu&background=4f46e5&color=fff" className="w-full h-full rounded-full" alt="Avatar" />
                </Link>
                <button onClick={handleLogout} className="text-[10px] font-black uppercase text-rose-500 hover:underline">Thoát</button>
              </div>
            ) : (
              <Link to="/login" className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all active:scale-95">Đăng nhập</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-10 w-full animate-fadeIn">
        <Outlet />
      </main>

      {/* FOOTER ĐẲNG CẤP */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-16 mb-8">
          <div className="col-span-1 md:col-span-1">
             <h3 className="text-white text-2xl font-black italic mb-6 uppercase tracking-tighter">Hieu<span className="text-indigo-500">Store</span></h3>
             <p className="text-sm leading-relaxed pr-4">Hệ thống phân phối trà sữa hàng đầu dành cho sinh viên ITC. Chất lượng từ tâm, giao hàng xứng tầm.</p>
          </div>
          <div>
             <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6 border-l-4 border-indigo-600 pl-3">Khám phá</h4>
             <ul className="space-y-4 text-sm font-bold">
                <li><Link to="/" className="hover:text-indigo-400 transition-colors">Thực đơn</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Góp ý dịch vụ</Link></li>
                <li className="hover:text-indigo-400 transition-colors cursor-pointer">Hệ thống cửa hàng</li>
             </ul>
          </div>
          <div>
             <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6 border-l-4 border-indigo-600 pl-3">Hỗ trợ</h4>
             <ul className="space-y-4 text-sm font-bold">
                <li className="hover:text-indigo-400 transition-colors cursor-pointer">Theo dõi đơn hàng</li>
                <li className="hover:text-indigo-400 transition-colors cursor-pointer">Chính sách bảo mật</li>
                <li className="hover:text-indigo-400 transition-colors cursor-pointer">Khiếu nại sản phẩm</li>
             </ul>
          </div>
          <div>
             <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6 border-l-4 border-indigo-600 pl-3">Trụ sở</h4>
             <p className="text-sm italic mb-2">📍 Phước Long B, TP. Thủ Đức, TP. HCM</p>
             <p className="text-sm italic mb-4">📞 Hotline: 1900 xxxx</p>
             <div className="flex gap-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black shadow-lg">F</div>
                <div className="w-8 h-8 bg-rose-500 text-white rounded-lg flex items-center justify-center font-black shadow-lg">I</div>
             </div>
          </div>
        </div>
        <p className="text-center text-[10px] font-black uppercase tracking-[0.5em] opacity-40">© 2026 Crafted with pride by Nguyen Duc Hieu</p>
      </footer>
    </div>
  );
};

export default ClientLayout;