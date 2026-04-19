import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationPage = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('hieu_store_token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter text-gray-900">Thông báo <span className="text-indigo-600">Của Sếp</span> 🔔</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Theo dõi cập nhật đơn hàng & hệ thống</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-[2.5rem] animate-pulse" />)}
        </div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
           <span className="text-6xl block mb-4">📭</span>
           <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Chưa có thông báo nào dành cho sếp</p>
        </div>
      ) : (
        <div className="space-y-6">
          {notifs.map(n => (
            <div key={n.id} className={`group p-8 rounded-[2.5rem] border-2 transition-all duration-300 relative overflow-hidden ${n.isRead ? 'bg-white border-gray-100' : 'bg-indigo-50/50 border-indigo-200 shadow-xl shadow-indigo-100/50'}`}>
              {!n.isRead && <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>}
              
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${n.type?.includes('ORDER') ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {n.type || 'SYSTEM'}
                  </span>
                  <h3 className="font-black text-gray-800 uppercase text-lg tracking-tight group-hover:text-indigo-600 transition-colors mt-2">{n.title}</h3>
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{new Date(n.createdAt).toLocaleString('vi-VN')}</span>
              </div>

              {/* 💡 NỘI DUNG THÔNG BÁO (CHỨA MÃ ĐƠN & TÊN MÓN) */}
              <p className="text-gray-600 font-bold text-sm leading-relaxed max-w-2xl italic">
                {n.message}
              </p>
              
              {n.linkUrl && (
                <button className="mt-6 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                  Bấm để xem chi tiết →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;