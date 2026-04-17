import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('hieu_store_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/PointTransactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-gray-800 uppercase italic tracking-tighter">
            Lịch sử <span className="text-emerald-600">Giao Dịch</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-[0.3em]">Hệ thống kiểm soát dòng tiền & Loyalty HieuStore</p>
        </div>
        <div className="text-right z-10">
            <p className="text-xs font-black text-gray-400 uppercase italic">Tổng số giao dịch</p>
            <p className="text-4xl font-black text-emerald-600">{transactions.length}</p>
        </div>
        <div className="absolute -right-10 -bottom-10 text-[150px] opacity-[0.03] font-black italic">MONEY</div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách Hàng</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chi tiết Đơn</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nội dung</th>
                <th className="p-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Biến động điểm</th>
                <th className="p-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-32 text-center font-black text-gray-300 italic uppercase animate-pulse">Đang trích xuất dữ liệu...</td></tr>
              ) : transactions.map(item => (
                <tr key={item.id} className="hover:bg-emerald-50/30 transition-all group">
                  {/* Cột Khách Hàng */}
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center font-black text-sm shadow-inner">
                        {item.customerName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-black text-gray-800 uppercase text-sm">{item.customerName || 'Khách vãng lai'}</div>
                        <div className="text-[9px] text-blue-600 font-bold tracking-widest uppercase">ID: {item.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Cột Giá Tổng Đơn */}
                  <td className="p-8">
                    <div className="space-y-1">
                        <div className="text-lg font-black text-gray-800 tracking-tighter">
                            {item.orderTotal > 0 ? `${item.orderTotal.toLocaleString()}đ` : '---'}
                        </div>
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                            Mã đơn: <span className="text-gray-900">#{item.orderCode}</span>
                        </div>
                    </div>
                  </td>

                  {/* Cột Nội Dung */}
                  <td className="p-8">
                    <p className="text-sm font-bold text-gray-500 italic max-w-xs line-clamp-1 group-hover:line-clamp-none transition-all cursor-help">
                        "{item.description}"
                    </p>
                  </td>

                  {/* Cột Biến Động Điểm */}
                  <td className="p-8 text-center">
                    <div className={`inline-flex items-center px-5 py-2 rounded-2xl font-black text-sm shadow-sm ${item.points > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {item.points > 0 ? `+${item.points}` : item.points} <span className="ml-1 text-[8px] opacity-70">PTS</span>
                    </div>
                  </td>

                  {/* Cột Thời Gian */}
                  <td className="p-8 text-right">
                    <div className="text-[10px] font-black text-gray-800 uppercase italic mb-1">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-[9px] font-bold text-gray-400 tracking-widest">
                        {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentManager;