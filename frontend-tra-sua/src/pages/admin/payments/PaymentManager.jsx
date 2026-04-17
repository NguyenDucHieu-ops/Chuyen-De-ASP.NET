import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Gọi API lấy lịch sử tích điểm của khách hàng
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/PointTransactions`);
      setTransactions(res.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu giao dịch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-800 uppercase italic">Giao Dịch & Điểm Thưởng 💳</h1>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Lịch sử tích lũy loyalty của toàn hệ thống</p>
        </div>
        <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner">💰</div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-tighter">ID Khách</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-tighter">Nội Dung Giao Dịch</th>
              <th className="p-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-tighter">Số Điểm</th>
              <th className="p-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-tighter">Thời Gian</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-20 text-center animate-pulse font-black text-gray-300 italic text-xl uppercase">
                  Đang truy xuất lịch sử giao dịch...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-20 text-center text-gray-400 font-bold italic">
                  Chưa có lịch sử tích điểm nào.
                </td>
              </tr>
            ) : (
              transactions.map(item => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-all group">
                  <td className="p-6">
                    <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl font-black text-[10px] shadow-sm">
                      USR-{item.userId}
                    </span>
                  </td>
                  <td className="p-6 font-bold text-gray-600 group-hover:text-blue-700 transition-colors italic">
                    "{item.description}"
                  </td>
                  <td className={`p-6 text-center font-black text-lg ${item.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.points > 0 ? `+${item.points}` : item.points}
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
  );
};

// DÒNG QUAN TRỌNG NHẤT ĐỂ FIX LỖI CỦA BẠN:
export default PaymentManager;