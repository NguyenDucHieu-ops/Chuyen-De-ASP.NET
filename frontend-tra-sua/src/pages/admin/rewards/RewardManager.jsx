import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RewardManager = () => {
  const token = localStorage.getItem('hieu_store_token');
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: 0, name: '', type: 'POINTS', value: 0, probability: 0, isActive: true });

  const [notify, setNotify] = useState({ show: false, msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setNotify({ show: true, msg, type });
    setTimeout(() => setNotify({ show: false, msg: '', type: 'success' }), 3000);
  };

  const fetchRewards = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Rewards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRewards(res.data);
    } catch  {
      showToast("Lỗi tải danh sách quà tặng!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRewards(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, probability: Number(formData.probability) };

      if (isEditing) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/Rewards/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Cập nhật phần thưởng thành công!");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/Rewards`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Thêm phần thưởng mới thành công!");
      }
      setShowModal(false);
      fetchRewards();
    } catch (err) {
      showToast(err.response?.data?.error || "Có lỗi xảy ra", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Sếp có chắc muốn xóa phần quà này khỏi vòng quay?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/Rewards/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Xóa thành công!");
        fetchRewards();
      } catch  {
        showToast("Lỗi khi xóa", "error");
      }
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ id: 0, name: '', type: 'POINTS', value: 0, probability: 0.1, isActive: true });
    setShowModal(true);
  };

  const openEditModal = (reward) => {
    setIsEditing(true);
    setFormData(reward);
    setShowModal(true);
  };

  // Tính tổng tỉ lệ
  const totalProbability = rewards.filter(r => r.isActive).reduce((sum, r) => sum + r.probability, 0);

  return (
    <div className="animate-fadeIn relative">
      {/* TOAST UI */}
      {notify.show && (
        <div className={`fixed top-10 right-10 z-[200] px-8 py-4 rounded-2xl font-black uppercase text-[10px] shadow-2xl animate-bounce tracking-widest ${notify.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {notify.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">Cơ Cấu Giải Thưởng 🎁</h1>
          <p className="text-sm font-bold text-gray-400 mt-1">Quản lý các phần quà trên Vòng Quay May Mắn</p>
        </div>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-95">
          + Thêm Quà Mới
        </button>
      </div>

      {/* CẢNH BÁO TỈ LỆ */}
      {Math.abs(totalProbability - 1.0) > 0.01 && (
         <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3">
            ⚠️ Cảnh báo: Tổng tỉ lệ của các phần quà đang bật là {(totalProbability * 100).toFixed(1)}%. Vui lòng điều chỉnh lại cho đúng 100% (1.0) để vòng quay hoạt động chính xác nhất!
         </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên Phần Quà</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Loại</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Giá Trị</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tỉ Lệ Trúng</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng Thái</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="p-10 text-center text-gray-400 font-bold italic">Đang tải dữ liệu...</td></tr>
              ) : rewards.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-gray-400 font-bold italic">Chưa có phần thưởng nào</td></tr>
              ) : (
                rewards.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-6 font-black text-gray-800">{r.name}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        r.type === 'POINTS' ? 'bg-blue-50 text-blue-600' : r.type === 'VOUCHER' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="p-6 font-bold text-gray-600">{r.value > 0 ? r.value.toLocaleString() : '-'}</td>
                    <td className="p-6 font-black text-emerald-600">{(r.probability * 100).toFixed(1)}%</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${r.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {r.isActive ? 'Đang bật' : 'Đã tắt'}
                      </span>
                    </td>
                    <td className="p-6 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(r)} className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">✏️</button>
                      <button onClick={() => handleDelete(r.id)} className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all">🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM / SỬA */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-scaleIn">
            <h2 className="text-2xl font-black text-gray-800 uppercase italic mb-8">
              {isEditing ? 'Sửa Phần Quà' : 'Thêm Phần Quà Mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Tên hiển thị (VD: Voucher 50k, Thêm 100 điểm)</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 font-bold text-gray-800 outline-none transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Loại quà</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 font-bold text-gray-800 outline-none transition-all cursor-pointer">
                    <option value="POINTS">Tặng Điểm</option>
                    <option value="VOUCHER">Tặng Voucher</option>
                    <option value="LUCK_NEXT_TIME">Trượt (Mất lượt)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Giá trị</label>
                  <input type="number" min="0" disabled={formData.type === 'LUCK_NEXT_TIME'} value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 font-bold text-gray-800 outline-none transition-all disabled:opacity-50" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Tỉ lệ trúng (0.0 đến 1.0) VD: 0.2 = 20%</label>
                <input type="number" step="0.01" min="0" max="1" required value={formData.probability} onChange={e => setFormData({...formData, probability: parseFloat(e.target.value)})} className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 font-bold text-gray-800 outline-none transition-all" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer ml-2">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                <span className="font-bold text-gray-700 text-sm">Cho phép xuất hiện trên Vòng quay</span>
              </label>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl hover:bg-gray-200 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">Lưu Lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardManager;