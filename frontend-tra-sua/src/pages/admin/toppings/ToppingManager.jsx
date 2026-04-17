import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ToppingManager = () => {
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ toppingName: '', price: 0, isActive: true });

  const headers = { Authorization: `Bearer ${localStorage.getItem('hieu_store_token')}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Toppings`);
      setToppings(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/Toppings/${editingId}`, { id: editingId, ...formData }, { headers });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/Toppings`, formData, { headers });
      }
      setIsModalOpen(false);
      fetchData();
    } catch { alert("Lỗi lưu Topping!"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa topping này?")) {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/Toppings/${id}`, { headers });
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black text-gray-800 uppercase italic">Topping Quán 🍬</h1>
        <button onClick={() => { setEditingId(null); setFormData({ toppingName: '', price: 0, isActive: true }); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700"
        >+ THÊM TOPPING</button>
      </div>
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-black uppercase">
            <tr>
              <th className="p-6">Tên Topping</th>
              <th className="p-6 text-center">Giá</th>
              <th className="p-6 text-center">Trạng Thái</th>
              <th className="p-6 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" className="p-10 text-center animate-pulse font-bold text-gray-300">ĐANG TẢI...</td></tr> : 
            toppings.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-all">
                <td className="p-6 font-black text-gray-700">{item.toppingName}</td>
                <td className="p-6 text-center font-black text-blue-600">+{item.price?.toLocaleString()}đ</td>
                <td className="p-6 text-center">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{item.isActive ? 'Bán' : 'Ngừng'}</span>
                </td>
                <td className="p-6 text-right space-x-2">
                  <button onClick={() => { setEditingId(item.id); setFormData(item); setIsModalOpen(true); }} className="text-blue-600 font-bold hover:underline">Sửa</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 font-bold hover:underline">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black mb-6 uppercase italic">{editingId ? "Sửa Topping" : "Thêm Topping"}</h2>
            <div className="space-y-4">
               <input type="text" placeholder="Tên topping..." value={formData.toppingName} onChange={e => setFormData({...formData, toppingName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500" />
               <input type="number" placeholder="Giá..." value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-blue-500" />
            </div>
            <div className="flex gap-4 mt-8">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">HỦY</button>
               <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black">LƯU KHO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToppingManager;