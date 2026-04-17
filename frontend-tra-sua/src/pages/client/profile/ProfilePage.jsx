import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfilePage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('hieu_store_token');

  useEffect(() => {
    if (token) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/Orders/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    }
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pt-6">
      {/* Thông tin User */}
      <div className="flex items-center gap-10 bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
         <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white text-6xl font-black shadow-2xl relative z-10">H</div>
         <div className="relative z-10">
            <h1 className="text-4xl font-black text-gray-800 uppercase italic tracking-tighter">Nguyen Duc Hieu</h1>
            <div className="flex gap-3 mt-3">
               <span className="text-blue-600 font-bold uppercase tracking-widest text-[10px] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">Cử Nhân Thực Hành</span>
               <span className="text-purple-600 font-bold uppercase tracking-widest text-[10px] bg-purple-50 px-4 py-1.5 rounded-full border border-purple-100">1,250 Điểm Thưởng</span>
            </div>
         </div>
         <div className="absolute top-0 right-0 p-12 text-8xl opacity-[0.03] font-black italic select-none">HIEUSTORE</div>
      </div>

      {/* Lịch sử đơn hàng */}
      <div className="space-y-6">
        <h3 className="text-3xl font-black italic uppercase tracking-tighter border-l-8 border-blue-600 pl-6">Hành trình đơn hàng</h3>
        {loading ? <div className="p-20 text-center animate-pulse font-black text-gray-300 uppercase tracking-widest">Đang kiểm tra hệ thống...</div> : (
          <div className="grid grid-cols-1 gap-5">
            {orders.length === 0 ? <p className="text-center py-10 font-bold text-gray-400 italic bg-white rounded-3xl border border-gray-100">Bạn chưa có kỷ niệm nào với HieuStore.</p> :
              orders.map(order => (
                <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex justify-between items-center group hover:border-blue-300 transition-all shadow-sm">
                  <div>
                    <p className="font-black text-gray-800 uppercase italic text-xl">Mã đơn #HIEU-{order.id}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                    <p className="text-[11px] font-black text-blue-600 mt-2 italic underline cursor-pointer">Xem chi tiết món</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-800 text-3xl mb-2">{order.finalAmount?.toLocaleString()}đ</p>
                    <span className={`text-[10px] font-black uppercase px-5 py-2 rounded-xl shadow-sm inline-block ${order.orderStatus === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {order.orderStatus === 'Completed' ? '● ĐÃ GIAO XONG' : '○ ĐANG XỬ LÝ'}
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;