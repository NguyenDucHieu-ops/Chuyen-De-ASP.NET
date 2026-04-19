import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; 
import * as signalR from '@microsoft/signalr';

const ClientLayout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('hieu_store_token');
  
  const [cartCount, setCartCount] = useState(() => {
    const saved = localStorage.getItem('hieu_cart');
    const cart = saved ? JSON.parse(saved) : [];
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  });

  // 💡 STATE CHO THÔNG BÁO (QUẢ CHUÔNG)
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifyToast, setNotifyToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setNotifyToast({ show: true, msg, type });
    setTimeout(() => setNotifyToast({ show: false, msg: '', type: 'success' }), 4000);
  };

  // 💡 HÀM 1: LẤY THÔNG BÁO TỪ DATABASE (FIX LỖI F5)
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("🔴 Lỗi tải thông báo:", err);
    }
  }, [token]);

  // 💡 HÀM 2: ĐÁNH DẤU ĐÃ ĐỌC KHI BẤM VÀO CHUÔNG
  const handleToggleNotif = async () => {
    setShowNotifDropdown(!showNotifDropdown);
    
    if (!showNotifDropdown && unreadCount > 0) {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/Notifications/mark-all-read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("🔴 Lỗi khi đánh dấu đã đọc:", err);
      }
    }
  };

  // 💡 KẾT NỐI SIGNALR & LOAD DỮ LIỆU BAN ĐẦU (ĐÃ FIX LỖI CASCADING)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // 1. Chỉ gọi fetch một lần duy nhất khi token thay đổi
    fetchNotifications();

    if (!token) return;

    // 2. Thiết lập kết nối SignalR
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/notificationHub`)
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => console.log("🟢 SignalR Connected!"))
      .catch(err => {
        if (err.message && err.message.includes("stopped during negotiation")) return;
        console.error("🔴 Lỗi kết nối SignalR: ", err);
      });

    connection.on("ReceiveNotification", (notif) => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const myUserId = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier'] || payload.nameid;

        // Chỉ hiện thông báo nếu targetUserId khớp với mình
        if (notif.userId == myUserId) {
          setNotifications(prev => [notif, ...prev]);
          setUnreadCount(prev => prev + 1);
          showToast(notif.title || "🔔 Thông báo mới!", 'success');
        }
      } catch (e) {
        console.error("Lỗi xử lý thông báo real-time:", e);
      }
    });

    return () => {
        connection.stop();
    };
  }, [token]); // 💡 Chỉ depend vào token, KHÔNG depend vào fetchNotifications để tránh cascading

  const updateCart = useCallback(() => {
    const saved = localStorage.getItem('hieu_cart');
    const cart = saved ? JSON.parse(saved) : [];
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel('hieu_cart_channel');
    const handleStorage = (e) => { if (e.key === 'hieu_cart') updateCart(); };
    window.addEventListener('storage', handleStorage);
    channel.addEventListener('message', updateCart);
    return () => {
      window.removeEventListener('storage', handleStorage);
      channel.close();
    };
  }, [updateCart]);

  const handleLogout = () => {
    if (window.confirm("Bạn muốn đăng xuất khỏi HieuStore?")) {
      localStorage.removeItem('hieu_store_token');
      navigate('/login');
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
    <div className="min-h-screen bg-[#fdfaf7] font-sans flex flex-col text-gray-900 overflow-x-hidden relative">
      
      {/* GLOBAL TOAST NOTIFICATION */}
      {notifyToast.show && (
        <div className={`fixed top-24 right-10 z-[9999] px-8 py-5 rounded-[2rem] font-black uppercase text-xs shadow-2xl animate-bounce tracking-widest border-2 flex items-center gap-3 ${
          notifyToast.type === 'success' 
          ? 'bg-emerald-500 text-white border-emerald-400' 
          : 'bg-indigo-600 text-white border-indigo-400'
        }`}>
          {notifyToast.type === 'success' ? '✅' : '🔔'} {notifyToast.msg}
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center text-white text-3xl shadow-xl group-hover:rotate-[12deg] group-active:scale-95 transition-all duration-300">
              🧋
            </div>
            <span className="text-3xl font-black tracking-[-2px] uppercase italic text-gray-900">
              Hieu<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Store</span>
            </span>
          </Link>

          <nav className="flex items-center gap-10 text-sm">
            <Link to="/products" className="font-semibold text-gray-600 hover:text-indigo-600 transition-all duration-200 relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-indigo-600 after:w-0 hover:after:w-full after:transition-all">THỰC ĐƠN</Link>
            <Link to="/articles" className="font-semibold text-gray-600 hover:text-indigo-600 transition-all duration-200 relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-indigo-600 after:w-0 hover:after:w-full after:transition-all">TIN TỨC</Link>
            <Link to="/contact" className="font-semibold text-gray-600 hover:text-indigo-600 transition-all duration-200 relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-indigo-600 after:w-0 hover:after:w-full after:transition-all">LIÊN HỆ</Link>

            {/* 🔔 CHUÔNG THÔNG BÁO */}
            {token && (
              <div className="relative group p-3 -mr-3">
                <span onClick={handleToggleNotif} className="text-3xl transition-transform group-hover:scale-110 duration-300 block cursor-pointer">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg ring-2 ring-white animate-pulse pointer-events-none">
                    {unreadCount}
                  </span>
                )}

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-6 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                    <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-black text-gray-800 uppercase text-[10px] tracking-widest">Thông báo gần đây</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 font-bold text-[10px] uppercase tracking-widest italic">Chưa có thông báo nào</div>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={i} className={`p-5 border-b border-gray-50 hover:bg-indigo-50/50 transition-colors cursor-pointer ${!n.isRead ? 'bg-indigo-50/20' : ''}`} onClick={() => { n.linkUrl && navigate(n.linkUrl); setShowNotifDropdown(false); }}>
                            <p className="font-black text-xs text-indigo-600 mb-1 uppercase leading-tight">{n.title}</p>
                            <p className="text-[10px] font-bold text-gray-500 leading-relaxed line-clamp-2">{n.message}</p>
                            <span className="text-[8px] text-gray-300 uppercase mt-2 block font-black">{new Date(n.createdAt).toLocaleString('vi-VN')}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <Link to="/notifications" onClick={() => setShowNotifDropdown(false)} className="block p-4 text-center bg-gray-50 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Xem tất cả thông báo</Link>
                  </div>
                )}
              </div>
            )}

            <Link to="/cart" className="relative group p-3 -mr-3">
              <span className="text-3xl transition-transform group-hover:scale-110 duration-300 block">🛒</span>
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg ring-2 ring-white">{cartCount}</span>}
            </Link>

            <div className="w-px h-7 bg-gray-200"></div>

            {token ? (
              <div className="flex items-center gap-5">
                {isAdmin() && <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-indigo-600 hover:underline">Quản trị</Link>}
                <Link to="/profile" className="relative w-10 h-10 rounded-2xl overflow-hidden border-2 border-white shadow-md hover:scale-110 transition-transform duration-300 ring-1 ring-gray-100">
                  <img src="https://ui-avatars.com/api/?name=Nguyen+Duc+Hieu&background=4f46e5&color=fff&bold=true" className="w-full h-full object-cover" alt="Avatar" />
                </Link>
                <button onClick={handleLogout} className="text-xs font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors">Thoát</button>
              </div>
            ) : (
              <Link to="/login" className="bg-gradient-to-r from-gray-900 to-black text-white px-9 py-3.5 rounded-3xl font-bold text-xs uppercase tracking-[0.125em] shadow-xl hover:from-indigo-600 hover:to-violet-600 active:scale-[0.97] transition-all duration-300">Đăng nhập</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full"><Outlet /></main>

      <footer className="bg-gray-950 text-gray-400 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-2xl">🧋</div>
              <span className="text-3xl font-black tracking-tighter text-white">HieuStore</span>
            </div>
            <p className="max-w-md text-sm leading-relaxed">Trà sữa cao cấp dành riêng cho cộng đồng sinh viên ITC. Nguyên liệu tươi ngon – Phục vụ từ tâm – Giao hàng nhanh chóng.</p>
          </div>
          <div className="md:col-span-3">
            <h4 className="uppercase text-xs tracking-[2px] font-bold text-white mb-6">Khám phá</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">Thực đơn</Link></li>
              <li><Link to="/articles" className="hover:text-white transition-colors">Tin tức & Khuyến mãi</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Góp ý</Link></li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <h4 className="uppercase text-xs tracking-[2px] font-bold text-white mb-6">Liên hệ</h4>
            <p className="text-sm mb-2">📍 Phước Long B, TP. Thủ Đức, TP. HCM</p>
            <p className="text-sm">📞 Hotline: 1900 xxxx</p>
          </div>
        </div>
        <div className="border-t border-gray-900 mt-16 pt-8 text-center text-[10px] tracking-[1px] font-mono opacity-50">© 2026 Nguyen Duc Hieu • Crafted with passion</div>
      </footer>
    </div>
  );
};

export default ClientLayout;