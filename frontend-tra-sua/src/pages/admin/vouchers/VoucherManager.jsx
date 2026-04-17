import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VoucherManager = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ code: '', discountAmount: 0, expiryDate: '', isActive: true });
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem('hieu_store_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Vouchers`);
      setVouchers(res.data);
    } catch { 
      console.error("Lỗi lấy danh sách Voucher!"); 
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.code.trim()) tempErrors.code = "Mã Voucher không được để trống!";
    if (formData.discountAmount <= 0) tempErrors.discountAmount = "Số tiền giảm phải lớn hơn 0đ!";
    if (!formData.expiryDate) tempErrors.expiryDate = "Vui lòng chọn ngày hết hạn!";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/Vouchers`, formData, { headers });
      alert("🎟️ Đã phát hành voucher thành công!"); // THÔNG BÁO
      setIsModalOpen(false);
      setFormData({ code: '', discountAmount: 0, expiryDate: '', isActive: true });
      setErrors({});
      fetchVouchers();
    } catch { 
      setErrors({ server: "Mã này đã tồn tại hoặc lỗi kết nối!" });
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Sếp muốn xóa vĩnh viễn mã giảm giá này?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/Vouchers/${id}`, { headers });
        alert("🗑️ Đã xóa voucher thành công!"); // THÔNG BÁO
        fetchVouchers();
      } catch { alert("Không thể xóa mã đang hoạt động!"); }
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white p-8 rounded-[3rem] shadow-sm flex flex-col md:flex-row justify-between items-center border border-gray-100 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-800 uppercase italic leading-none">Khuyến Mãi <span className="text-purple-600">Voucher</span></h1>
          <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-[0.3em] ml-1">HieuStore Marketing Hub</p>
        </div>
        <button onClick={() => { setErrors({}); setIsModalOpen(true); }} className="bg-gray-900 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl hover:bg-purple-600 transition-all uppercase tracking-widest text-xs">+ PHÁT HÀNH MÃ</button>
      </div>

      {loading ? (
        <div className="text-center py-32 font-black text-gray-200 italic animate-pulse text-3xl uppercase">Đang nạp dữ liệu...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vouchers.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-[3rem] text-gray-400 font-bold italic uppercase">Hệ thống trống mã.</div>
          ) : (
            vouchers.map(v => (
              <div key={v.id} className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-purple-400 transition-all">
                <div className="absolute top-0 right-0 p-5">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border ${v.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {v.isActive ? '● Đang chạy' : '○ Hết hạn'}
                  </span>
                </div>
                <h3 className="text-5xl font-black text-purple-600 tracking-tighter mb-4 italic">{v.code}</h3>
                <p className="text-3xl font-black text-gray-800 tracking-tight">-{v.discountAmount?.toLocaleString()}đ</p>
                <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1 italic">Hết hạn</p>
                    <p className="text-sm font-black text-gray-600">{new Date(v.expiryDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <button onClick={() => handleDelete(v.id)} className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all font-black text-xl shadow-inner">×</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3.5rem] p-12 w-full max-w-md shadow-2xl animate-[zoomIn_0.3s_ease-out]">
            <h2 className="text-3xl font-black mb-10 uppercase italic text-center text-gray-800 tracking-tighter">Tạo Chiến Dịch</h2>
            {errors.server && <p className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold text-center mb-6">{errors.server}</p>}
            <div className="space-y-6">
               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-4 mb-2 block tracking-widest">Mã định danh</label>
                 <input type="text" value={formData.code} onChange={e => {setFormData({...formData, code: e.target.value.toUpperCase()}); if (errors.code) setErrors({...errors, code: null});}} className={`w-full p-5 bg-gray-50 rounded-[1.5rem] font-black border-2 outline-none transition-all ${errors.code ? 'border-rose-500 bg-rose-50' : 'border-transparent focus:border-purple-500'}`} placeholder="VÍ DỤ: GIAM50" />
                 {errors.code && <p className="text-[10px] text-rose-500 font-black mt-2 ml-4 uppercase italic">⚠ {errors.code}</p>}
               </div>
               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-4 mb-2 block tracking-widest">Số tiền giảm</label>
                 <input type="number" value={formData.discountAmount} onChange={e => {setFormData({...formData, discountAmount: parseInt(e.target.value) || 0}); if (errors.discountAmount) setErrors({...errors, discountAmount: null});}} className={`w-full p-5 bg-gray-50 rounded-[1.5rem] font-black border-2 outline-none transition-all text-xl text-purple-600 ${errors.discountAmount ? 'border-rose-500 bg-rose-50' : 'border-transparent focus:border-purple-500'}`} />
                 {errors.discountAmount && <p className="text-[10px] text-rose-500 font-black mt-2 ml-4 uppercase italic">⚠ {errors.discountAmount}</p>}
               </div>
               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-4 mb-2 block tracking-widest">Ngày hết hạn</label>
                 <input type="date" value={formData.expiryDate} onChange={e => {setFormData({...formData, expiryDate: e.target.value}); if (errors.expiryDate) setErrors({...errors, expiryDate: null});}} className={`w-full p-5 bg-gray-50 rounded-[1.5rem] font-black border-2 outline-none transition-all ${errors.expiryDate ? 'border-rose-500 bg-rose-50' : 'border-transparent focus:border-purple-500'}`} />
                 {errors.expiryDate && <p className="text-[10px] text-rose-500 font-black mt-2 ml-4 uppercase italic">⚠ {errors.expiryDate}</p>}
               </div>
            </div>
            <div className="flex gap-4 mt-12">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-gray-100 rounded-[1.8rem] font-black text-gray-400 uppercase hover:bg-gray-200 transition-all">HỦY</button>
               <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-5 bg-purple-600 text-white rounded-[1.8rem] font-black shadow-xl hover:bg-purple-700 active:scale-95 transition-all uppercase disabled:opacity-50">
                  {isSaving ? "CHỜ..." : "PHÁT HÀNH 🚀"}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherManager;