import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ToppingManager = () => {
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ toppingName: '', price: 0, isActive: true });
  
  // Quản lý lỗi để nhuộm đỏ
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem('hieu_store_token');
  const headers = { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Toppings`);
      setToppings(res.data);
    } catch { 
      console.error("Lỗi lấy dữ liệu kho topping!"); 
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Validation trực quan
  const validateForm = () => {
    let tempErrors = {};
    if (!formData.toppingName.trim()) tempErrors.toppingName = "Tên topping không được để trống!";
    if (formData.price < 0) tempErrors.price = "Giá không được để số âm!";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Đổi trạng thái nhanh
  const toggleStatus = async (item) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/Toppings/${item.id}`, 
        { ...item, isActive: !item.isActive }, { headers });
      alert("✨ Cập nhật trạng thái thành công!"); // THÔNG BÁO
      fetchData();
    } catch { 
      alert("❌ Không thể đổi trạng thái!");
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/Toppings/${editingId}`, { id: editingId, ...formData }, { headers });
        alert("✅ Đã cập nhật thông tin topping!"); // THÔNG BÁO
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/Toppings`, formData, { headers });
        alert("🎉 Đã thêm topping mới vào kho!"); // THÔNG BÁO
      }
      setIsModalOpen(false);
      setErrors({});
      fetchData();
    } catch { 
      setErrors({ server: "Lỗi hệ thống khi lưu dữ liệu!" });
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Sếp có chắc muốn xóa vĩnh viễn topping này?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/Toppings/${id}`, { headers });
        alert("🗑️ Đã xóa topping thành công!"); // THÔNG BÁO
        fetchData();
      } catch { 
        alert("❌ Lỗi xóa! Topping này có thể đang nằm trong đơn hàng.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div>
           <h1 className="text-3xl font-black text-gray-800 uppercase italic leading-none">Kho Topping <span className="text-blue-600">HieuStore</span></h1>
           <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Quản lý nguyên liệu pha chế</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData({ toppingName: '', price: 0, isActive: true }); setErrors({}); setIsModalOpen(true); }}
          className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
        >+ THÊM MỚI</button>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-400 font-black uppercase tracking-widest">
            <tr>
              <th className="p-8">Tên Topping</th>
              <th className="p-8 text-center">Giá Bán</th>
              <th className="p-8 text-center">Trạng Thái</th>
              <th className="p-8 text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="4" className="p-20 text-center animate-pulse font-black text-gray-300 uppercase">Đang nạp dữ liệu...</td></tr>
            ) : toppings.map(item => (
              <tr key={item.id} className="hover:bg-blue-50/30 transition-all group">
                <td className="p-8">
                   <div className="font-black text-gray-700 text-lg italic">{item.toppingName}</div>
                   <div className="text-[10px] text-gray-300 font-bold uppercase mt-1">ID: #TOP-{item.id}</div>
                </td>
                <td className="p-8 text-center font-black text-blue-600 text-xl">+{item.price?.toLocaleString()}đ</td>
                <td className="p-8 text-center">
                   <button 
                    onClick={() => toggleStatus(item)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${item.isActive ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-rose-100 text-rose-600 border border-rose-200'}`}
                   >
                     {item.isActive ? '✅ Đang Bán' : '❌ Ngừng Bán'}
                   </button>
                </td>
                <td className="p-8 text-right space-x-3">
                  <button onClick={() => { setEditingId(item.id); setFormData(item); setErrors({}); setIsModalOpen(true); }} className="bg-gray-100 text-gray-600 p-3 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all">Sửa</button>
                  <button onClick={() => handleDelete(item.id)} className="bg-rose-50 text-rose-400 p-3 rounded-xl font-black text-[10px] uppercase hover:bg-rose-600 hover:text-white transition-all">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-[zoomIn_0.3s_ease-out]">
            <h2 className="text-3xl font-black mb-8 uppercase italic text-gray-800 tracking-tighter underline decoration-blue-600 decoration-4 underline-offset-8">{editingId ? "Cập Nhật" : "Thêm Topping"}</h2>
            
            {errors.server && <p className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-[10px] font-black uppercase text-center mb-6">{errors.server}</p>}

            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Tên gọi</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Trân châu đen..." 
                    value={formData.toppingName} 
                    onChange={e => {
                      setFormData({...formData, toppingName: e.target.value});
                      if (errors.toppingName) setErrors({...errors, toppingName: null});
                    }} 
                    className={`w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none border-2 transition-all ${errors.toppingName ? 'border-rose-500 bg-rose-50' : 'border-transparent focus:border-blue-500'}`} 
                  />
                  {errors.toppingName && <p className="text-[10px] text-rose-500 font-black mt-2 ml-4 uppercase italic">⚠ {errors.toppingName}</p>}
               </div>

               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Giá cộng thêm</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={formData.price} 
                    onChange={e => {
                      setFormData({...formData, price: parseInt(e.target.value) || 0});
                      if (errors.price) setErrors({...errors, price: null});
                    }} 
                    className={`w-full p-5 bg-gray-50 rounded-[1.5rem] font-black outline-none border-2 transition-all text-xl text-blue-600 ${errors.price ? 'border-rose-500 bg-rose-50' : 'border-transparent focus:border-blue-500'}`} 
                  />
                  {errors.price && <p className="text-[10px] text-rose-500 font-black mt-2 ml-4 uppercase italic">⚠ {errors.price}</p>}
               </div>

               <div className="flex items-center gap-3 px-4">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-blue-600 cursor-pointer" id="active" />
                  <label htmlFor="active" className="font-black text-xs uppercase text-gray-500 cursor-pointer select-none">Kích hoạt bán ngay</label>
               </div>
            </div>

            <div className="flex gap-4 mt-10">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-gray-100 rounded-[1.5rem] font-black text-gray-400 uppercase hover:bg-gray-200 transition-all">HỦY</button>
               <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50">
                  {isSaving ? "ĐANG LƯU..." : "LƯU KHO 📦"}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToppingManager;