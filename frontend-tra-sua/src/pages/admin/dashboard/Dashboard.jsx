import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Tổng Đơn Hàng", value: "0", icon: "🛒", color: "blue" },
    { label: "Doanh Thu", value: "0đ", icon: "💰", color: "green" },
    { label: "Sản Phẩm", value: "0", icon: "🧋", color: "orange" },
    { label: "Khách Hàng", value: "0", icon: "👥", color: "purple" }
  ]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('hieu_store_token')}` };
        
        // Gọi 3 API cùng lúc để lấy dữ liệu tổng thể
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/Orders/history`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Products`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Users`)
        ]);

        const orders = ordersRes.data;
        const products = productsRes.data;
        const users = usersRes.data;

        // 1. Tính tổng doanh thu từ các đơn hàng "Completed"
        const totalRevenue = orders
          .filter(o => o.orderStatus === 'Completed')
          .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

        // 2. Cập nhật mảng Stats
        setStats([
          { label: "Tổng Đơn Hàng", value: orders.length.toLocaleString(), icon: "🛒", color: "blue" },
          { label: "Doanh Thu", value: totalRevenue.toLocaleString() + "đ", icon: "💰", color: "green" },
          { label: "Sản Phẩm", value: products.length.toLocaleString(), icon: "🧋", color: "orange" },
          { label: "Khách Hàng", value: users.length.toLocaleString(), icon: "👥", color: "purple" }
        ]);

        // 3. Lấy 5 đơn hàng mới nhất để hiện ở bảng phụ
        setRecentOrders(orders.slice(0, 5));

      } catch (err) {
        console.error("Lỗi đồng bộ Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Cụm Thống Kê Tổng Quát */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500">{stat.icon}</div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-3xl font-black text-gray-800 mt-2">
              {loading ? <span className="animate-pulse">...</span> : stat.value}
            </h3>
            {/* Trang trí nhẹ nhàng cho xịn */}
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gray-50 rounded-full opacity-50"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bảng Đơn Hàng Mới Nhất (Dữ liệu thật) */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-xl italic text-blue-600 underline decoration-2 underline-offset-8">Đơn Hàng Mới Nhất</h3>
            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase">Live</span>
          </div>
          
          <div className="space-y-4">
            {loading ? (
               [1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-2xl"></div>)
            ) : recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center p-5 bg-gray-50/50 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                  <div>
                    <div className="font-black text-gray-800 italic text-sm">#ORD-{order.id}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-600 font-black">{(order.finalAmount || 0).toLocaleString()}đ</div>
                    <div className={`text-[8px] font-black uppercase mt-1 ${order.orderStatus === 'Completed' ? 'text-green-500' : 'text-orange-500'}`}>
                      {order.orderStatus}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 font-bold italic">Chưa có đơn hàng nào được ghi nhận.</div>
            )}
          </div>
        </div>
        
        {/* Trạng Thái Kết Nối SQL Server */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className={`w-24 h-24 ${loading ? 'bg-gray-100' : 'bg-green-50'} rounded-full flex items-center justify-center text-4xl mb-6 mx-auto shadow-inner`}>
              {loading ? "⏳" : "⚡"}
            </div>
            <h3 className="font-black text-xl uppercase tracking-tight text-gray-800">Kết Nối Ổn Định</h3>
            <p className="text-sm text-gray-400 mt-3 max-w-[250px] font-medium">
              Toàn bộ dữ liệu được đồng bộ trực tiếp từ Database của <span className="text-blue-600 font-black">HiếuStore</span>.
            </p>
            {!loading && (
              <div className="mt-6 inline-block px-6 py-2 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase">
                Database Online: {new Date().toLocaleTimeString()}
              </div>
            )}
          </div>
          {/* Background pattern cho "nghệ" */}
          <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl font-black italic select-none">DATA</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;