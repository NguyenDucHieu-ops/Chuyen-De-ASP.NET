import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PaginatedList from '../../../components/PaginatedList'; // 💡 IMPORT PHÂN TRANG

const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  
  const [notify, setNotify] = useState({ show: false, msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setNotify({ show: true, msg, type });
    setTimeout(() => setNotify({ show: false, msg: '', type: 'success' }), 3000);
  };

  const fetchReviews = () => {
    const token = localStorage.getItem('hieu_store_token');
    axios.get(`${import.meta.env.VITE_API_URL}/api/Reviews`, {
      headers: { Authorization: `Bearer ${token}` }
    }) 
      .then(res => setReviews(res.data))
      .catch(err => console.error("Lỗi lấy Review:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReply = async (reviewId) => {
    if (!replyText.trim()) return showToast("Sếp chưa nhập nội dung phản hồi!", "error");
    
    const token = localStorage.getItem('hieu_store_token');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/Reviews/${reviewId}/reply`, 
        `"${replyText}"`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      showToast("Đã phản hồi khách hàng thành công! ✨");
      setReplyingTo(null);
      setReplyText('');
      
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, adminReply: replyText } : r));
    } catch (err) {
      showToast(err.response?.data?.error || "Lỗi gửi phản hồi!", "error");
    }
  };

  return (
    <div className="space-y-6 relative animate-fadeIn">
      {notify.show && (
        <div className={`fixed top-10 right-10 z-[200] px-8 py-4 rounded-2xl font-black uppercase text-[10px] shadow-2xl animate-bounce tracking-widest ${notify.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {notify.msg}
        </div>
      )}

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 uppercase italic">Phản Hồi Khách Hàng ⭐</h1>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Đánh giá thực tế từ người dùng hệ thống</p>
        </div>
        <div className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">
           Tổng cộng: {reviews.length} đánh giá
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-black text-gray-400 italic animate-bounce text-xl">
          Đang trích xuất dữ liệu đánh giá...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400 font-bold italic">Chưa có khách hàng nào để lại bình luận.</div>
      ) : (
        /* 💡 SỬ DỤNG PAGINATED LIST */
        <PaginatedList 
          data={reviews} 
          itemsPerPage={4} 
          listClassName="grid grid-cols-1 md:grid-cols-2 gap-8"
          isTable={false}
          renderItem={(r) => (
            <div key={r.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col gap-5">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg border-2 border-white shadow-blue-500/20">
                    {r.user?.fullName?.charAt(0) || "H"}
                  </div>
                  <div>
                     <h4 className="font-black text-gray-800 text-lg">{r.user?.fullName || `Khách hàng #${r.userId}`}</h4>
                     <div className="flex text-yellow-400 text-xs mt-0.5">
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                     </div>
                  </div>
                  <span className="ml-auto text-[10px] font-black text-gray-300 uppercase italic">Mã đơn: #{r.orderId}</span>
               </div>

               <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-50">
                  <p className="text-gray-600 font-bold italic leading-relaxed">"{r.comment}"</p>
               </div>

               {r.reviewImages && r.reviewImages.length > 0 && (
                 <div className="flex gap-3 mt-2 overflow-x-auto pb-2">
                    {r.reviewImages.map((img, i) => (
                       <img 
                         key={i} 
                         src={`${import.meta.env.VITE_API_URL}${img.imageUrl}`} 
                         className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-md hover:scale-110 transition-transform cursor-zoom-in" 
                         alt="Review" 
                       />
                    ))}
                 </div>
               )}

               {r.adminReply ? (
                 <div className="bg-indigo-50/80 p-5 rounded-2xl border border-indigo-100 mt-2 relative overflow-hidden">
                   <div className="absolute -right-4 -top-4 text-6xl opacity-10">👑</div>
                   <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
                     Quán phản hồi
                   </p>
                   <p className="text-gray-700 font-medium text-sm">"{r.adminReply}"</p>
                 </div>
               ) : (
                 <div className="mt-2">
                   {replyingTo === r.id ? (
                     <div className="flex flex-col gap-3 animate-fadeIn">
                       <textarea
                         className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-medium outline-none transition-all resize-none"
                         rows="2"
                         placeholder="Nhập phản hồi gửi đến khách hàng..."
                         value={replyText}
                         onChange={(e) => setReplyText(e.target.value)}
                         autoFocus
                       ></textarea>
                       <div className="flex justify-end gap-3">
                         <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="px-5 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">Hủy</button>
                         <button onClick={() => handleSubmitReply(r.id)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors active:scale-95">Gửi phản hồi 🚀</button>
                       </div>
                     </div>
                   ) : (
                     <button onClick={() => { setReplyingTo(r.id); setReplyText(''); }} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1.5">
                       ↳ Viết phản hồi
                     </button>
                   )}
                 </div>
               )}

               <div className="text-[10px] text-gray-400 font-black uppercase text-right mt-auto pt-4">
                  Đã đăng lúc: {new Date(r.createdAt).toLocaleString('vi-VN')}
               </div>
            </div>
          )}
        />
      )}
    </div>
  );
};

export default ReviewManager;