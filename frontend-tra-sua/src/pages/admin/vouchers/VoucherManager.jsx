import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VoucherManager = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true); // Đã sửa để sử dụng bên dưới
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', discountAmount: 0, expiryDate: '', isActive: true });

  const headers = { Authorization: `Bearer ${localStorage.getItem('hieu_store_token')}` };

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Vouchers`);
      setVouchers(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách Voucher:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleSave = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/Vouchers`, formData, { headers });
      alert("Phát hành mã giảm giá thành công!");
      setIsModalOpen(false);
      fetchVouchers();
    } catch {
      alert("Lỗi khi tạo Voucher! Vui lòng kiểm tra lại.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex justify-between items-center border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-800 uppercase italic">Khuyến Mãi 🎟️</h1>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Hệ thống phát hành mã giảm giá</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-purple-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-purple-700 transition-all active:scale-95"
        >
          + TẠO VOUCHER
        </button>
      </div>

      {/* HIỆU ỨNG LOADING KHI CHỜ API */}
      {loading ? (
        <div className="text-center py-20 font-black text-gray-300 italic animate-pulse text-xl">
          Đang nạp danh sách Voucher...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-400 font-bold italic">Chưa có mã giảm giá nào được tạo.</div>
          ) : (
            vouchers.map(v => (
              <div key={v.id} className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-8 relative overflow-hidden group hover:border-purple-400 transition-all">
                <div className="absolute top-0 right-0 p-4">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${v.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {v.isActive ? 'Đang chạy' : 'Hết hạn'}
                  </span>
                </div>
                <h3 className="text-4xl font-black text-purple-600 tracking-tighter mb-2">{v.code}</h3>
                <p className="text-xl font-black text-gray-800 mt-2">Giảm trực tiếp: {v.discountAmount?.toLocaleString()}đ</p>
                <div className="mt-6 border-t border-gray-100 pt-4 flex justify-between items-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase italic">Ngày hết hạn</p>
                  <p className="text-xs font-black text-gray-600">{new Date(v.expiryDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL THÊM VOUCHER */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl animate-fadeIn">
            <h2 className="text-2xl font-black mb-8 uppercase italic text-center text-gray-800">Tạo Voucher Mới</h2>
            <div className="space-y-5">
               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-3 mb-1 block">Mã Code (Ví dụ: GIAM20K)</label>
                 <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full p-4 bg-gray-50 rounded-2xl font-black border-2 border-transparent focus:border-purple-500 outline-none transition-all" placeholder="NHẬP MÃ..." />
               </div>
               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-3 mb-1 block">Số tiền giảm (VNĐ)</label>
                 <input type="number" value={formData.discountAmount} onChange={e => setFormData({...formData, discountAmount: parseInt(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-black border-2 border-transparent focus:border-purple-500 outline-none transition-all" />
               </div>
               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-3 mb-1 block">Hạn dùng đến ngày</label>
                 <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-black border-2 border-transparent focus:border-purple-500 outline-none transition-all" />
               </div>
            </div>
            <div className="flex gap-4 mt-10">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-200 transition-all">HỦY</button>
               <button onClick={handleSave} className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-all">PHÁT HÀNH</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherManager;