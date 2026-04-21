import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('hieu_store_token');

  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [user, setUser] = useState({ fullName: '', email: '', phone: '', address: '', currentPoints: 0 });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', address: '' });
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // --- STATE QUẢN LÝ REVIEW ---
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- THÔNG BÁO HỆ THỐNG ---
  const [notify, setNotify] = useState({ show: false, msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setNotify({ show: true, msg, type });
    setTimeout(() => setNotify({ show: false, msg: '', type: 'success' }), 3000);
  };

  // --- FETCH DỮ LIỆU TỪ BACKEND ---
  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [uRes, oRes, vRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/Users/profile`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/Orders/history`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/Vouchers`)
      ]);
      setUser(uRes.data);
      setFormData({
        fullName: uRes.data.fullName || '', 
        phone: uRes.data.phone || '', 
        address: uRes.data.address || ''
      });
      setOrders(oRes.data);
      setVouchers(vRes.data);
    } catch (err) { 
      console.error("Lỗi tải dữ liệu:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem('hieu_store_token'); 
        navigate('/login');
      }
    } finally { setLoadingOrders(false); }
  };

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchData();
  }, [token]);

  // --- XỬ LÝ ĐỔI VOUCHER ---
  const handleRedeemVoucher = async (voucher) => {
    if (!voucher.pointsRequired || voucher.pointsRequired === 0) {
      navigator.clipboard.writeText(voucher.code);
      return showToast(`Đã copy mã: ${voucher.code}`);
    }

    if (user.currentPoints < voucher.pointsRequired) {
      return showToast(`Sếp cần thêm ${voucher.pointsRequired - user.currentPoints} điểm nữa mới đổi được!`, 'error');
    }

    if (window.confirm(`Dùng ${voucher.pointsRequired} điểm để lấy mã "${voucher.discountAmount.toLocaleString()}đ" nhé sếp?`)) {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Vouchers/redeem/${voucher.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast(res.data.message);
        navigator.clipboard.writeText(res.data.code); 
        fetchData(); 
      } catch (err) {
        showToast(err.response?.data?.error || "Lỗi đổi điểm!", 'error');
      }
    }
  };

  // --- XỬ LÝ CẬP NHẬT HỒ SƠ ---
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
    } catch { 
      showToast('Lỗi cập nhật, sếp kiểm tra lại backend nhé!', 'error'); 
    } finally { setLoadingUpdate(false); }
  };

  // --- XỬ LÝ GỬI ĐÁNH GIÁ ---
  const handleSubmitReview = async () => {
    if (!comment.trim()) return showToast("Sếp viết vài chữ review nhé!", "error");
    setIsSubmitting(true);
    
    const submitData = new FormData();
    const productId = selectedOrder?.orderDetails?.[0]?.productId;
    
    if (!productId) {
        setIsSubmitting(false);
        return showToast("Không tìm thấy món ăn trong đơn này để đánh giá!", "error");
    }

    submitData.append('ProductId', Number(productId)); 
    submitData.append('OrderId', Number(selectedOrder.id));
    submitData.append('Rating', Number(rating));
    submitData.append('Comment', comment);
    
    if (images && images.length > 0) {
        images.forEach(img => submitData.append('Images', img));
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/Reviews`, submitData, { 
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
      });
      showToast("Cảm ơn sếp đã đánh giá! ⭐");
      setShowReviewModal(false); setComment(''); setImages([]); setRating(5);
      
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, isReviewed: true } : o));
    } catch (err) { 
      showToast(err.response?.data?.error || "Lỗi đánh giá!", "error"); 
    } finally { setIsSubmitting(false); }
  };

  const handleLogout = () => {
    if (window.confirm("Sếp có chắc chắn muốn đăng xuất không?")) {
      localStorage.removeItem('hieu_store_token'); navigate('/login');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative animate-fadeIn">
      {/* NOTIFY TOAST */}
      {notify.show && (
        <div className={`fixed top-10 right-10 z-[200] px-8 py-4 rounded-2xl font-black uppercase text-[10px] shadow-2xl animate-bounce tracking-widest ${notify.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {notify.msg}
        </div>
      )}

      {/* HEADER: USER CARD */}
      <div className="bg-white p-10 md:p-12 rounded-[3.5rem] shadow-xl border border-indigo-50 flex flex-col md:flex-row items-center justify-between gap-10 mb-12 relative overflow-hidden">
        <div className="flex items-center gap-8 z-10 w-full md:w-auto">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-800 flex items-center justify-center text-white text-5xl font-black shadow-2xl shrink-0">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'H'}
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 uppercase italic mb-1 tracking-tighter">{user.fullName || "Đang tải..."}</h1>
            <p className="text-gray-500 font-bold text-sm mb-4">{user.email}</p>
            <div className="flex gap-3">
              <span className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-100">
                ⭐ {(user.currentPoints || 0).toLocaleString()} Điểm thưởng
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
            📦 Lịch sử mua hàng
          </button>
          <button onClick={() => setActiveTab('vouchers')} className={`w-full text-left px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'vouchers' ? 'bg-amber-500 text-white shadow-xl translate-x-2' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}>
            🎟️ Kho Voucher
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-xl translate-x-2' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}>
            ⚙️ Thông tin cá nhân
          </button>
        </div>

        {/* CỘT PHẢI: NỘI DUNG */}
        <div className="lg:col-span-9">
          
          {/* --- TAB 1: ĐƠN HÀNG --- */}
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
                </div>
              ) : (
                <div className="space-y-5">
                  {orders.map(order => {
                    const isCompleted = order.orderStatus === 2 || order.orderStatus === '2' || order.orderStatus === 'Completed';
                    const isCancelled = order.orderStatus === 3 || order.orderStatus === '3' || order.orderStatus === 'Cancelled';
                    
                    const completedDate = new Date(order.updatedAt || order.createdAt);
                    const daysPassed = (new Date() - completedDate) / (1000 * 60 * 60 * 24);
                    const isReviewable = daysPassed <= 2; 

                    return (
                      <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center group hover:shadow-xl hover:border-indigo-200 transition-all gap-6">
                        <div className="space-y-2 flex-1">
                          <p className="font-black text-gray-900 text-xl tracking-tighter uppercase">Mã đơn #HIEU-{order.id}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">
                            🗓️ {new Date(order.createdAt).toLocaleString('vi-VN')}
                          </p>
                          {/* 💡 FIX 1: HIỂN THỊ TÊN MÓN ĂN TẠI ĐÂY */}
                          <p className="text-sm font-bold text-indigo-600 mt-2 line-clamp-2">
                             {order.orderDetails?.map(item => item.productName).join(', ') || 'Đang tải món ăn...'}
                          </p>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0 border-gray-100">
                          <div className="text-left md:text-right">
                            <p className="font-black text-gray-900 text-3xl mb-2 tracking-tighter">{order.finalAmount?.toLocaleString()}đ</p>
                            <div className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                              isCompleted ? 'bg-emerald-50 text-emerald-600' : 
                              isCancelled ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {isCompleted ? '✓ Đã hoàn thành' : isCancelled ? '✕ Đã hủy' : '● Đang xử lý'}
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {isCompleted && (
                              <>
                                {order.isReviewed ? (
                                  <button disabled className="w-full md:w-auto bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 opacity-90 cursor-not-allowed border-2 border-gray-800">
                                    <span className="text-yellow-400">★</span> ĐÃ ĐÁNH GIÁ
                                  </button>
                                ) : isReviewable ? (
                                  <button 
                                    onClick={() => { setSelectedOrder(order); setShowReviewModal(true); }}
                                    className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                                  >
                                    ⭐ Đánh giá ngay
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                                    Quá hạn đánh giá
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* --- TAB 2: VOUCHER --- */}
          {activeTab === 'vouchers' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-gray-800 uppercase italic flex items-center gap-4">
                  <div className="w-2 h-8 bg-amber-500 rounded-full"></div> Ưu đãi của tôi
                </h3>
                <div className="bg-amber-50 text-amber-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-amber-100">
                  Hiện có: {(user.currentPoints || 0).toLocaleString()} Điểm
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vouchers.map(v => (
                  <div key={v.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-amber-200 hover:border-amber-400 transition-all flex flex-col justify-between h-full relative overflow-hidden group">
                    <div className="z-10">
                      <p className="text-3xl font-black text-amber-600 mb-1">{v.discountAmount?.toLocaleString()}đ</p>
                      <p className="font-black text-gray-800 text-lg uppercase tracking-tight">{v.code}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">{v.description || "Áp dụng cho mọi đơn hàng"}</p>
                    </div>
                    <div className="z-10 mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">HSD: {new Date(v.expiryDate).toLocaleDateString('vi-VN')}</p>
                      <button 
                        onClick={() => handleRedeemVoucher(v)} 
                        className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                          v.pointsRequired > 0 ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200' : 'bg-gray-900 text-white hover:bg-gray-700'
                        }`}
                      >
                        {v.pointsRequired > 0 ? `Đổi ${v.pointsRequired} Điểm` : 'Copy Mã'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- TAB 3: THÔNG TIN TÀI KHOẢN --- */}
          {activeTab === 'settings' && (
            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-gray-100 shadow-sm animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <h3 className="text-2xl font-black text-gray-800 uppercase italic flex items-center gap-4">
                  <div className="w-2 h-8 bg-indigo-600 rounded-full"></div> Hồ sơ cá nhân
                </h3>
                
                <div className="flex gap-3">
                   {/* 💡 FIX 3: NÚT ĐỔI MẬT KHẨU LINK SANG TRANG FORGOT PASSWORD */}
                   <Link 
                      to="/forgot-password" 
                      className="bg-rose-50 text-rose-500 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                   >
                      Đổi mật khẩu 🔒
                   </Link>

                   {!isEditing && (
                     <button onClick={() => setIsEditing(true)} className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                       Chỉnh sửa ✏️
                     </button>
                   )}
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Họ và tên</label>
                    <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} disabled={!isEditing} className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-5 font-black text-gray-800 outline-none transition-all disabled:opacity-50" required />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Số điện thoại</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} disabled={!isEditing} className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-5 font-black text-gray-800 outline-none transition-all disabled:opacity-50" required />
                  </div>

                  {/* 💡 FIX 2: THÊM Ô ĐỊA CHỈ VÀO FORM */}
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Địa chỉ giao hàng mặc định</label>
                    <textarea 
                       value={formData.address} 
                       onChange={(e) => setFormData({...formData, address: e.target.value})} 
                       disabled={!isEditing} 
                       className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-5 font-black text-gray-800 outline-none transition-all disabled:opacity-50 resize-none" 
                       rows="2" 
                       placeholder="Nhập địa chỉ của sếp (VD: 123 Đường ABC, Quận XYZ)"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email đăng nhập</label>
                  <input type="email" value={user.email} disabled className="w-full bg-gray-100 rounded-2xl px-6 py-5 font-black text-gray-400 cursor-not-allowed" />
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

      {/* --- MODAL REVIEW --- */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[150] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-12 shadow-2xl animate-fadeIn relative">
            <button onClick={() => setShowReviewModal(false)} className="absolute top-10 right-10 text-3xl font-black text-gray-300 hover:text-rose-500 transition-colors">×</button>
            <h2 className="text-3xl font-black mb-2 uppercase italic text-indigo-600">Đánh giá chất lượng</h2>
            <p className="text-gray-400 text-xs font-bold uppercase mb-8 tracking-widest">Cho đơn hàng #HIEU-{selectedOrder?.id}</p>
            <div className="space-y-8">
              <div className="flex justify-center gap-4 text-5xl">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRating(s)} className={`transition-all hover:scale-110 ${s <= rating ? 'text-yellow-400 drop-shadow-md' : 'text-gray-200'}`}>★</button>
                ))}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Cảm nhận của sếp</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-[2rem] p-6 font-bold text-gray-800 outline-none transition-all resize-none" rows="4" placeholder="Trà sữa đỉnh chóp..." />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Gửi kèm hình ảnh</label>
                <input type="file" multiple accept="image/*" onChange={e => setImages(Array.from(e.target.files))} className="w-full p-5 bg-gray-50 rounded-[2rem] font-black text-xs cursor-pointer border-2 border-transparent focus:border-indigo-500" />
              </div>
              <button onClick={handleSubmitReview} disabled={isSubmitting} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95">
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