import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true); // Đã sửa để sử dụng bên dưới

  useEffect(() => {
    // API lấy review sản phẩm, mặc định lấy sản phẩm số 1 hoặc tùy backend
    axios.get(`${import.meta.env.VITE_API_URL}/api/Reviews/product/1`) 
      .then(res => setReviews(res.data))
      .catch(err => console.error("Lỗi lấy Review:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h1 className="text-3xl font-black text-gray-800 uppercase italic">Phản Hồi Khách Hàng ⭐</h1>
        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Đánh giá thực tế từ người dùng hệ thống</p>
      </div>

      {/* XỬ LÝ TRẠNG THÁI LOADING */}
      {loading ? (
        <div className="text-center py-20 font-black text-gray-400 italic animate-bounce text-xl">
          Đang trích xuất dữ liệu đánh giá...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-400 font-bold italic">Chưa có khách hàng nào để lại bình luận.</div>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col gap-5">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg border-2 border-white shadow-blue-500/20">
                      {r.user?.fullName?.charAt(0) || "H"}
                    </div>
                    <div>
                       <h4 className="font-black text-gray-800 text-lg">Khách hàng #{r.userId}</h4>
                       <div className="flex text-yellow-400 text-xs mt-0.5">
                          {/* Hiển thị sao dựa trên rating thực tế */}
                          {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                       </div>
                    </div>
                    <span className="ml-auto text-[10px] font-black text-gray-300 uppercase italic">Mã đơn: #{r.orderId}</span>
                 </div>

                 <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-50">
                    <p className="text-gray-600 font-bold italic leading-relaxed">"{r.comment}"</p>
                 </div>

                 {/* HIỂN THỊ HÌNH ẢNH ĐI KÈM ĐÁNH GIÁ (NẾU CÓ) */}
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

                 <div className="text-[10px] text-gray-400 font-black uppercase text-right mt-auto">
                    Thời gian: {new Date(r.createdAt).toLocaleString('vi-VN')}
                 </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewManager;