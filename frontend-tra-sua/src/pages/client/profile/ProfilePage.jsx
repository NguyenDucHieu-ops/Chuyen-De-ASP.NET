import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('hieu_store_token');

  // States
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' hoặc 'settings'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // User Profile States
  const [user, setUser] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // 1. Lấy thông tin user (Sửa lại URL API này cho đúng với Backend C# của Hiếu nhé)
    axios.get(`${import.meta.env.VITE_API_URL}/api/Users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setUser(res.data);
      setFormData(res.data); // Đổ data vào form sửa
    })
    .catch(err => {
      console.error("Chưa có API Profile hoặc lỗi:", err);
      // Fallback tạm thời nếu C# chưa viết API này
      const fallbackUser = { fullName: 'Nguyen Duc Hieu', email: 'hieu.itc@gmail.com', phone: '0901234567', address: 'Thủ Đức, TP.HCM' };
      setUser(fallbackUser);
      setFormData(fallbackUser);
    });

    // 2. Lấy lịch sử đơn hàng
    axios.get(`${import.meta.env.VITE_API_URL}/api/Orders/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setOrders(res.data))
    .catch(err => console.error("Lỗi lấy đơn hàng:", err))
    .finally(() => setLoadingOrders(false));
  }, [token, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    try {
      // Gọi API Cập nhật profile (Backend C# cần có API PUT này)
      await axios.put(`${import.meta.env.VITE_API_URL}/api/Users/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(formData);
      setIsEditing(false);
      alert('✅ Cập nhật thông tin thành công!');
    } catch (error) {
      console.error(error);
      alert('❌ Cập nhật thất bại, vui lòng kiểm tra lại API Backend!');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem('hieu_store_token');
      navigate('/login');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-[fadeIn_0.5s_ease-out]">
      
      {/* HEADER: THÔNG TIN USER (Đã làm Dynamic) */}
      <div className="flex flex-col md:flex-row items-center gap-10 bg-white p-10 md:p-12 rounded-[3.5rem] shadow-xl border border-indigo-50 relative overflow-hidden mb-12">
        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-800 flex items-center justify-center text-white text-5xl font-black shadow-2xl relative z-10 shrink-0">
          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'H'}
        </div>
        <div className="relative z-10 text-center md:text-left flex-1">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">
            {user.fullName || "Khách Hàng VIP"}
          </h1>
          <p className="text-gray-500 font-medium mb-4">{user.email || "Đang cập nhật email..."}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="text-indigo-700 font-bold uppercase tracking-widest text-xs bg-indigo-50 px-5 py-2 rounded-full border border-indigo-100">
              💎 Thành Viên VIP
            </span>
            <span className="text-emerald-700 font-bold uppercase tracking-widest text-xs bg-emerald-50 px-5 py-2 rounded-full border border-emerald-100">
              ⭐ 1,250 Điểm
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="relative z-10 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 rounded-2xl font-bold transition-colors shadow-sm"
        >
          Đăng Xuất
        </button>

        {/* Chữ chìm background */}
        <div className="absolute -top-10 -right-10 text-9xl opacity-[0.02] font-black italic select-none pointer-events-none">
          HIEUSTORE
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* CỘT TRÁI: MENU NAVIGATION */}
        <div className="lg:col-span-3 space-y-3">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-8 py-5 rounded-3xl font-bold transition-all ${
              activeTab === 'orders' 
                ? 'bg-zinc-900 text-white shadow-xl translate-x-2' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            📦 Lịch sử mua hàng
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-8 py-5 rounded-3xl font-bold transition-all ${
              activeTab === 'settings' 
                ? 'bg-indigo-600 text-white shadow-xl translate-x-2' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            ⚙️ Cài đặt tài khoản
          </button>
        </div>

        {/* CỘT PHẢI: NỘI DUNG TƯƠNG ỨNG VỚI TAB */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: LỊCH SỬ ĐƠN HÀNG */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-[fadeInScale_0.3s_ease-out]">
              <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-zinc-900 rounded-full inline-block"></span>
                Hành trình đơn hàng của bạn
              </h3>
              
              {loadingOrders ? (
                <div className="p-20 text-center animate-pulse font-bold text-gray-400">Đang tải dữ liệu...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                  <span className="text-6xl mb-4 block">🛒</span>
                  <p className="font-bold text-gray-600 text-xl">Bạn chưa có kỷ niệm nào với HieuStore.</p>
                  <p className="text-gray-400 mt-2">Hãy thử đặt một ly trà sữa thật ngon nhé!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-indigo-300 transition-all shadow-sm gap-4">
                      <div>
                        <p className="font-black text-gray-900 text-xl">Mã đơn #HIEU-{order.id}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase mt-2 tracking-widest flex items-center gap-2">
                          🕒 {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </p>
                        <p className="text-sm font-bold text-indigo-600 mt-3 hover:underline cursor-pointer">Xem chi tiết món →</p>
                      </div>
                      <div className="text-left md:text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                        <p className="font-black text-gray-900 text-3xl mb-3">{order.finalAmount?.toLocaleString()}đ</p>
                        <span className={`text-xs font-black uppercase px-4 py-2 rounded-xl shadow-sm inline-block ${
                          order.orderStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                          order.orderStatus === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {order.orderStatus === 'Completed' ? '● ĐÃ GIAO XONG' : 
                           order.orderStatus === 'Cancelled' ? '● ĐÃ HỦY' : '○ ĐANG XỬ LÝ'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CÀI ĐẶT TÀI KHOẢN (FORM CHỈNH SỬA) */}
          {activeTab === 'settings' && (
            <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-gray-100 shadow-sm animate-[fadeInScale_0.3s_ease-out]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                  <span className="w-2 h-8 bg-indigo-600 rounded-full inline-block"></span>
                  Thông tin cá nhân
                </h3>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-bold transition-colors text-sm"
                  >
                    ✏️ Chỉnh sửa
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(user); // Hủy sửa thì reset lại data cũ
                    }}
                    className="text-gray-500 hover:text-rose-500 font-bold transition-colors text-sm"
                  >
                    Hủy bỏ
                  </button>
                )}
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Họ và tên */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Họ và tên</label>
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      disabled={!isEditing}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      placeholder="Nhập họ và tên..."
                      required
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Số điện thoại</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!isEditing}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      placeholder="09xx xxx xxx"
                      required
                    />
                  </div>
                </div>

                {/* Email (Thường không cho sửa, hoặc disable) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email đăng nhập</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled // Không cho sửa email để tránh lỗi đăng nhập
                    className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-5 py-4 font-semibold text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-gray-400 italic mt-1">* Email không thể thay đổi sau khi đăng ký.</p>
                </div>

                {/* Địa chỉ */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Địa chỉ giao hàng mặc định</label>
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    disabled={!isEditing}
                    rows="3"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed resize-none"
                    placeholder="Nhập địa chỉ nhận hàng của bạn..."
                  ></textarea>
                </div>

                {isEditing && (
                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loadingUpdate}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loadingUpdate ? 'Đang lưu...' : '💾 Lưu Thay Đổi'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;