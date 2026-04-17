import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('hieu_store_token');

  // --- STATES ---
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' hoặc 'settings'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [user, setUser] = useState({ fullName: '', email: '', phone: '', address: '', currentPoints: 0 });
  
  // States cho Profile Form
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', address: '' });
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // States cho Đánh giá (Review)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notify, setNotify] = useState({ show: false, msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setNotify({ show: true, msg, type });
    setTimeout(() => setNotify({ show: false, msg: '', type: 'success' }), 3000);
  };

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [uRes, oRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/Users/profile`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/Orders/history`, { headers })
      ]);
      setUser(uRes.data);
      setFormData({
        fullName: uRes.data.fullName || '',
        phone: uRes.data.phone || '',
        address: uRes.data.address || ''
      });
      setOrders(oRes.data);
    } catch (err) { 
      console.error(err); 
      if(err.response?.status === 401) {
        localStorage.removeItem('hieu_store_token');
        navigate('/login');
      }
    } finally { 
      setLoadingOrders(false); 
    }
  };

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchData();
  }, [token]);

  // --- XỬ LÝ CẬP NHẬT TÀI KHOẢN ---
// --- XỬ LÝ CẬP NHẬT TÀI KHOẢN ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/Users/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...user, ...formData });
      setIsEditing(false);
      showToast('Cập nhật hồ sơ thành công! ✨');
    } catch (err) { // 💡 Sửa 'error' thành 'err' ở đây
      console.error("Lỗi API Cập nhật:", err); // 💡 Dùng biến 'err' để ESLint không kêu ca nữa
      showToast('Lỗi cập nhật, sếp kiểm tra lại backend nhé!', 'error');
    } finally {
      setLoadingUpdate(false);
    }
  };

  // --- XỬ LÝ ĐĂNG ĐÁNH GIÁ ---
  const handleSubmitReview = async () => {
    if (!comment.trim()) return showToast("Sếp viết vài chữ review nhé!", "error");
    setIsSubmitting(true);
    
    const submitData = new FormData();
    // Tạm thời gán ProductId = 1 để test, thực tế sẽ lấy từ OrderDetails
    submitData.append('ProductId', 1); 
    submitData.append('OrderId', selectedOrder.id);
    submitData.append('Rating', rating);
    submitData.append('Comment', comment);
    images.forEach(img => submitData.append('Images', img));

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/Reviews`, submitData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      showToast("Cảm ơn sếp đã đánh giá! ⭐");
      setShowReviewModal(false);
      setComment(''); setImages([]); setRating(5);
    } catch (err) {
      showToast(err.response?.data?.error || "Lỗi đánh giá!", "error");
    } finally { setIsSubmitting(false); }
  };

  const handleLogout = () => {
    if (window.confirm("Sếp có chắc chắn muốn đăng xuất không?")) {
      localStorage.removeItem('hieu_store_token');
      navigate('/login');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative animate-fadeIn">
      {/* 🔔 TOAST */}
      {notify.show && (
        <div className={`fixed top-10 right-10 z-[200] px-8 py-4 rounded-2xl font-black uppercase text-[10px] shadow-2xl animate-bounce tracking-widest ${notify.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {notify.msg}
        </div>
      )}

      {/* HEADER: USER CARD THÔNG TIN TÀI KHOẢN */}
      <div className="bg-white p-10 md:p-12 rounded-[3.5rem] shadow-xl border border-indigo-50 flex flex-col md:flex-row items-center justify-between gap-10 mb-12 relative overflow-hidden">
        <div className="flex items-center gap-8 z-10 w-full md:w-auto">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-800 flex items-center justify-center text-white text-5xl font-black shadow-2xl shrink-0">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'H'}
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 uppercase italic mb-1 tracking-tighter">{user.fullName || "Đang tải..."}</h1>
            <p className="text-gray-500 font-bold text-sm mb-4">{user.email}</p>
            <div className="flex gap-3">
              <span className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                ⭐ {user.currentPoints?.toLocaleString() || 0} Điểm
              </span>
              <span className="bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hidden sm:inline-block">
                💎 Thành viên VIP
              </span>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className="z-10 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 w-full md:w-auto">
          Đăng Xuất
        </button>

        <div className="absolute -right-10 -bottom-10 text-9xl opacity-[0.02] font-black italic select-none pointer-events-none">HIEUSTORE</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* CỘT TRÁI: MENU */}
        <div className="lg:col-span-3 space-y-3">
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-gray-900 text-white shadow-xl translate-x-2' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}>
            📦 Lịch sử đơn hàng
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-xl translate-x-2' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}>
            ⚙️ Thông tin tài khoản
          </button>
        </div>

        {/* CỘT PHẢI: NỘI DUNG TAB */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: ĐƠN HÀNG */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-2xl font-black text-gray-800 mb-8 uppercase italic flex items-center gap-4">
                <div className="w-2 h-8 bg-gray-900 rounded-full"></div> Lịch sử thưởng thức
              </h3>
              
              {loadingOrders ? (
                <div className="p-32 text-center font-black text-gray-300 italic uppercase animate-pulse">Đang trích xuất lịch sử...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                  <span className="text-7xl mb-6 block">🥤</span>
                  <p className="font-black text-gray-400 uppercase text-sm tracking-widest">Sếp chưa có đơn hàng nào!</p>
                  <button onClick={() => navigate('/products')} className="mt-6 text-indigo-600 font-black uppercase text-[10px] tracking-[3px] border-b-2 border-indigo-600 pb-1">Đặt ngay ly đầu tiên</button>
                </div>
              ) : (
                <div className="space-y-5">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center group hover:shadow-xl hover:border-indigo-200 transition-all gap-6">
                      <div className="space-y-2">
                        <p className="font-black text-gray-900 text-xl tracking-tighter uppercase">Mã đơn #HIEU-{order.id}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">
                          🗓️ {new Date(order.createdAt).toLocaleDateString('vi-VN')} | {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0 border-gray-100">
                        <div className="text-left md:text-right">
                          <p className="font-black text-gray-900 text-3xl mb-2 tracking-tighter">{order.finalAmount?.toLocaleString()}đ</p>
                          <div className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                            order.orderStatus === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                            order.orderStatus === 'Cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {order.orderStatus === 'Completed' ? '✓ Đã hoàn thành' : 
                             order.orderStatus === 'Cancelled' ? '✕ Đã hủy' : '● Đang xử lý'}
                          </div>
                        </div>
                        
                        {/* HIỆN NÚT ĐÁNH GIÁ NẾU ĐÃ HOÀN THÀNH */}
                        {order.orderStatus === 'Completed' && (
                          <button 
                            onClick={() => { setSelectedOrder(order); setShowReviewModal(true); }}
                            className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
                          >
                            ⭐ Đánh giá
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: THÔNG TIN TÀI KHOẢN (ĐÃ ĐƯỢC PHỤC HỒI) */}
          {activeTab === 'settings' && (
            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-gray-100 shadow-sm animate-fadeIn">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-gray-800 uppercase italic flex items-center gap-4">
                  <div className="w-2 h-8 bg-indigo-600 rounded-full"></div> Hồ sơ cá nhân
                </h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                    Chỉnh sửa ✏️
                  </button>
                )}
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Họ và tên khách hàng</label>
                    <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} disabled={!isEditing} className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-5 font-black text-gray-800 outline-none transition-all disabled:opacity-50" required />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Số điện thoại liên lạc</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} disabled={!isEditing} className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-5 font-black text-gray-800 outline-none transition-all disabled:opacity-50" required />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email đăng nhập (Cố định)</label>
                  <input type="email" value={user.email} disabled className="w-full bg-gray-100 rounded-2xl px-6 py-5 font-black text-gray-400 cursor-not-allowed" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Địa chỉ giao hàng mặc định</label>
                  <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} disabled={!isEditing} rows="3" className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-5 font-black text-gray-800 outline-none transition-all disabled:opacity-50 resize-none"></textarea>
                </div>

                {isEditing && (
                  <div className="pt-6 flex gap-4">
                    <button type="button" onClick={() => { setIsEditing(false); setFormData({fullName: user.fullName, phone: user.phone, address: user.address}); }} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200">Hủy bỏ</button>
                    <button type="submit" disabled={loadingUpdate} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                      {loadingUpdate ? 'Đang lưu...' : 'Lưu thay đổi 💾'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

        </div>
      </div>

      {/* ⭐ REVIEW MODAL (HIỆN LÊN GIỮA MÀN HÌNH) */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[150] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-12 shadow-2xl animate-fadeIn relative">
            <button onClick={() => setShowReviewModal(false)} className="absolute top-10 right-10 text-3xl font-black text-gray-300 hover:text-rose-500 transition-colors">×</button>
            <h2 className="text-3xl font-black mb-2 uppercase italic text-indigo-600">Đánh giá chất lượng</h2>
            <p className="text-gray-400 text-xs font-bold uppercase mb-8 tracking-widest">Cho đơn hàng #HIEU-{selectedOrder?.id}</p>

            <div className="space-y-8">
              {/* Chọn sao */}
              <div className="flex justify-center gap-4 text-5xl">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRating(s)} className={`transition-all hover:scale-110 ${s <= rating ? 'text-yellow-400 drop-shadow-md' : 'text-gray-200'}`}>★</button>
                ))}
              </div>

              {/* Bình luận */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Cảm nhận của sếp</label>
                <textarea 
                  value={comment} 
                  onChange={e => setComment(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-[2rem] p-6 font-bold text-gray-800 outline-none transition-all resize-none"
                  rows="4"
                  placeholder="Trà sữa đỉnh chóp, shipper đẹp trai..."
                />
              </div>

              {/* Upload ảnh */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Gửi kèm hình ảnh sống ảo</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={e => setImages(Array.from(e.target.files))}
                  className="w-full p-5 bg-gray-50 rounded-[2rem] font-black text-xs cursor-pointer border-2 border-transparent focus:border-indigo-500"
                />
              </div>

              <button 
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
              >
                {isSubmitting ? "Đang xử lý..." : "Gửi đánh giá ngay 🚀"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;