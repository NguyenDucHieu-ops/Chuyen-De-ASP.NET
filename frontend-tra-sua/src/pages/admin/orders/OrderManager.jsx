import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Quản lý Modal Xem Chi Tiết
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Orders`);
      setOrders(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Đổi trạng thái đơn hàng (0: Chờ duyệt, 1: Đang làm, 2: Hoàn thành, 3: Đã Hủy)
  const updateOrderStatus = async (id, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/Orders/${id}/status`, newStatus, {
         headers: { 'Content-Type': 'application/json' }
      });
      fetchOrders(); // Load lại bảng
      if (selectedOrder) setSelectedOrder({...selectedOrder, status: newStatus}); // Cập nhật luôn trong modal nếu đang mở
    } catch { alert("Lỗi cập nhật trạng thái!"); }
  };

  const openOrderDetails = async (id) => {
    try {
       // Thường API lấy 1 đơn hàng sẽ trả kèm cả danh sách món ăn (OrderDetails) bên trong
       const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Orders/${id}`);
       setSelectedOrder(res.data);
       setIsDetailModalOpen(true);
    } catch { alert("Không lấy được chi tiết đơn!"); }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 0: return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg font-bold text-xs">Chờ Duyệt</span>;
      case 1: return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold text-xs">Đang Pha Chế</span>;
      case 2: return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold text-xs">Hoàn Thành</span>;
      case 3: return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-bold text-xs">Đã Hủy</span>;
      default: return <span>Khác</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black text-gray-800">Quản Lý Đơn Hàng</h1>
        <p className="text-sm text-gray-400 font-bold uppercase mt-1">Theo dõi và xử lý order</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold">
            <tr>
              <th className="p-4">Mã Đơn</th>
              <th className="p-4">Khách Hàng</th>
              <th className="p-4 text-center">Tổng Tiền</th>
              <th className="p-4 text-center">Trạng Thái</th>
              <th className="p-4 text-right">Xử Lý</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="p-10 text-center text-gray-400">Đang tải...</td></tr> : 
            orders.map(order => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-800">#{order.id}</td>
                <td className="p-4">
                   <div className="font-bold">{order.customerName}</div>
                   <div className="text-xs text-gray-500">{order.phone}</div>
                </td>
                <td className="p-4 text-center font-black text-blue-600">{order.totalAmount?.toLocaleString()}đ</td>
                <td className="p-4 text-center">{getStatusBadge(order.status)}</td>
                <td className="p-4 text-right">
                  <button onClick={() => openOrderDetails(order.id)} className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors">Xem / Xử lý</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-2xl">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
               <h2 className="text-2xl font-black">Chi Tiết Đơn #{selectedOrder.id}</h2>
               {getStatusBadge(selectedOrder.status)}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
               <div className="bg-gray-50 p-4 rounded-xl">
                 <p className="font-bold text-gray-500 mb-1 uppercase">Thông tin khách</p>
                 <p className="font-black text-lg">{selectedOrder.customerName}</p>
                 <p>SĐT: {selectedOrder.phone}</p>
                 <p>Địa chỉ: {selectedOrder.address}</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-xl">
                 <p className="font-bold text-gray-500 mb-1 uppercase">Thanh toán</p>
                 <p className="font-black text-2xl text-blue-600">{selectedOrder.totalAmount?.toLocaleString()}đ</p>
                 <p>Phương thức: Tiền mặt (COD)</p>
                 <p>Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
               </div>
            </div>

            <h3 className="font-black text-lg mb-2">Danh Sách Món:</h3>
            <div className="max-h-40 overflow-y-auto mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
               {/* Kiểm tra xem API có trả về OrderDetails không */}
               {selectedOrder.orderDetails && selectedOrder.orderDetails.length > 0 ? (
                 selectedOrder.orderDetails.map((detail, idx) => (
                   <div key={idx} className="flex justify-between border-b border-gray-200 py-2 last:border-0">
                      <div>
                        <span className="font-bold">{detail.productName}</span> 
                        <span className="text-xs text-gray-500 ml-2">(Size: {detail.size || 'M'})</span>
                        <div className="text-xs text-gray-400">Topping: {detail.toppingNames || 'Không'}</div>
                      </div>
                      <div className="font-bold text-blue-600">{detail.quantity} x {detail.unitPrice?.toLocaleString()}đ</div>
                   </div>
                 ))
               ) : (
                 <p className="text-gray-500 italic">Không có chi tiết (API chưa Include OrderDetails)</p>
               )}
            </div>

            <div className="border-t pt-4 flex items-center justify-between">
               <button onClick={() => setIsDetailModalOpen(false)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">Đóng</button>
               
               <div className="space-x-2">
                 {selectedOrder.status === 0 && (
                   <button onClick={() => updateOrderStatus(selectedOrder.id, 1)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Duyệt & Pha chế</button>
                 )}
                 {selectedOrder.status === 1 && (
                   <button onClick={() => updateOrderStatus(selectedOrder.id, 2)} className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600">Xác nhận Hoàn Thành</button>
                 )}
                 {(selectedOrder.status === 0 || selectedOrder.status === 1) && (
                   <button onClick={() => updateOrderStatus(selectedOrder.id, 3)} className="px-6 py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200">Hủy Đơn</button>
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