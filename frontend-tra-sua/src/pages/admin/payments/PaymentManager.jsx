import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('hieu_store_token');
      // GỬI TOKEN: Phải có dòng này Backend mới cho phép truy cập
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/PointTransactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu giao dịch:", err);
      if (err.response?.status === 403) alert("Sếp ơi, tài khoản này không có quyền Admin!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-800 uppercase italic leading-none">Giao Dịch <span className="text-emerald-600">& Điểm Thưởng</span></h1>
          <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-[0.2em]">Lịch sử loyalty toàn hệ thống HieuStore</p>
        </div>
        <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner relative z-10">💰</div>
        <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 font-black italic">POINTS</div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách Hàng</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nội Dung</th>
                <th className="p-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Biến Động</th>
                <th className="p-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-24 text-center animate-pulse">
                    <p className="font-black text-gray-300 italic text-xl uppercase tracking-widest">Đang kết nối database...</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-gray-400 font-bold italic">Chưa có dữ liệu tích điểm nào được ghi nhận.</td>
                </tr>
              ) : (
                transactions.map(item => (
                  <tr key={item.id} className="hover:bg-emerald-50/20 transition-all group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center font-black text-xs">U-{item.userId}</div>
                        <span className="font-black text-gray-700">Khách hàng #{item.userId}</span>
                      </div>
                    </td>
                    <td className="p-6 font-bold text-gray-600 italic">"{item.description}"</td>
                    <td className="p-6 text-center">
                      <span className={`font-black text-lg px-4 py-1 rounded-full ${item.points > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {item.points > 0 ? `+${item.points}` : item.points}
                      </span>
                    </td>
                    <td className="p-6 text-right text-[10px] font-black text-gray-400">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentManager;