import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const token = localStorage.getItem('hieu_store_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Orders`, { headers });
      setOrders(res.data);
    } catch { console.error("Lỗi tải đơn!"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateOrderStatus = async (id, newStatus) => {
    setIsUpdating(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/Orders/${id}/status`, newStatus, {
         headers: { ...headers, 'Content-Type': 'application/json' }
      });
      alert(newStatus === 2 ? "🎉 Đơn hoàn thành & Đã cộng điểm cho khách!" : "⚡ Đã cập nhật trạng thái!");
      await fetchOrders(); 
      setIsDetailModalOpen(false);
    } catch { alert("❌ Lỗi xử lý đơn hàng!"); }
    finally { setIsUpdating(false); }
  };

  const openOrderDetails = async (id) => {
    try {
       const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Orders/${id}`, { headers });
       setSelectedOrder(res.data);
       setIsDetailModalOpen(true);
    } catch { alert("❌ Lỗi lấy chi tiết!"); }
  };

  const getStatusBadge = (status) => {
    // Ép kiểu về string và trim khoảng trắng để so sánh chuẩn nhất
    const s = String(status || "").trim();
    const configs = {
      "0": { label: "Chờ Duyệt", class: "bg-amber-100 text-amber-700 border-amber-200" },
      "1": { label: "Đang Làm", class: "bg-blue-100 text-blue-700 border-blue-200" },
      "2": { label: "Thành Công", class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      "3": { label: "Đã Hủy", class: "bg-rose-100 text-rose-700 border-rose-200" }
    };
    return <span className={`px-4 py-1.5 rounded-xl font-black text-[10px] uppercase border ${configs[s]?.class || "bg-gray-100 text-gray-500"}`}>
      {configs[s]?.label || "Chưa xác định"}
    </span>;
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-800 uppercase italic">Quản Lý <span className="text-blue-600">Đơn Hàng</span></h1>
        <button onClick={fetchOrders} className="p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-all">🔄 Làm mới</button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100 font-black text-[10px] text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="p-6">Mã Đơn</th>
              <th className="p-6">Khách Hàng</th>
              <th className="p-6 text-center">Tổng Tiền</th>
              <th className="p-6 text-center">Trạng Thái</th>
              <th className="p-6 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="5" className="p-24 text-center animate-pulse font-black text-gray-300 uppercase italic">Đang lấy dữ liệu đơn hàng...</td></tr>
            ) : orders.map(order => (
              <tr key={order.id} className="hover:bg-blue-50/30 transition-all">
                <td className="p-6 font-black text-gray-800">#ORD-{order.id}</td>
                <td className="p-6">
                   <div className="font-black text-gray-700">{order.customerName}</div>
                   <div className="text-[10px] text-gray-400 font-bold uppercase">{order.phone}</div>
                </td>
                <td className="p-6 text-center font-black text-blue-600">{(order.totalAmount || 0).toLocaleString()}đ</td>
                <td className="p-6 text-center">{getStatusBadge(order.status)}</td>
                <td className="p-6 text-right">
                  <button onClick={() => openOrderDetails(order.id)} className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-blue-600 transition-all active:scale-95">Xử lý ngay</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-3xl shadow-2xl animate-[zoomIn_0.3s_ease-out]">
            <div className="flex justify-between items-start border-b pb-6 mb-8">
               <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-800">Chi tiết Đơn #{selectedOrder.id}</h2>
               {getStatusBadge(selectedOrder.status)}
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
               <div className="bg-gray-50 p-6 rounded-[2rem]">
                 <p className="text-[10px] font-black text-gray-400 mb-1 uppercase">Người nhận</p>
                 <p className="font-black text-xl text-gray-800">{selectedOrder.customerName}</p>
                 <p className="text-sm font-bold text-gray-500 italic mt-1 leading-relaxed">📍 {selectedOrder.address}</p>
               </div>
               <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100 flex flex-col justify-center">
                 <p className="text-[10px] font-black text-blue-200 mb-1 uppercase tracking-widest">Tổng tiền thanh toán</p>
                 <p className="font-black text-4xl">{(selectedOrder.totalAmount || 0).toLocaleString()}đ</p>
               </div>
            </div>

            <div className="max-h-40 overflow-y-auto mb-10 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
               {selectedOrder.orderDetails?.map((detail, idx) => (
                 <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <span className="font-black text-gray-700">{detail.productName} (x{detail.quantity})</span>
                    <span className="font-black text-blue-600">{detail.unitPrice?.toLocaleString()}đ</span>
                 </div>
               ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-100">
               <button onClick={() => setIsDetailModalOpen(false)} className="px-10 py-5 bg-gray-100 text-gray-500 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Quay lại</button>
               
               <div className="flex-1 flex gap-3">
                 {/* FIX LOGIC HIỆN NÚT: Chấp nhận cả số lẫn chuỗi, nếu status lạ thì vẫn hiện cho Admin xử lý */}
                 {(String(selectedOrder.status) === "0" || !["1","2","3"].includes(String(selectedOrder.status))) && (
                   <button 
                    disabled={isUpdating}
                    onClick={() => updateOrderStatus(selectedOrder.id, 1)} 
                    className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                   >
                     {isUpdating ? '...' : '✅ Nhận Đơn'}
                   </button>
                 )}

                 {String(selectedOrder.status) === "1" && (
                   <button 
                    disabled={isUpdating}
                    onClick={() => updateOrderStatus(selectedOrder.id, 2)} 
                    className="flex-1 py-5 bg-emerald-500 text-white rounded-[1.5rem] font-black uppercase shadow-xl hover:bg-emerald-600 transition-all disabled:opacity-50"
                   >
                     {isUpdating ? '...' : '🥤 Hoàn Thành'}
                   </button>
                 )}

                 {/* Luôn cho nút Hủy hiện ra nếu đơn chưa Thành công/Đã hủy */}
                 {String(selectedOrder.status) !== "2" && String(selectedOrder.status) !== "3" && (
                   <button 
                    disabled={isUpdating}
                    onClick={() => updateOrderStatus(selectedOrder.id, 3)} 
                    className="px-8 py-5 bg-rose-50 text-rose-600 rounded-[1.5rem] font-black uppercase hover:bg-rose-100 transition-all disabled:opacity-50"
                   >
                     ❌ Hủy
                   </button>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;