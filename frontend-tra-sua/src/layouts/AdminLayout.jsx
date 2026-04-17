import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem('hieu_store_token');
      navigate('/login');
    }
  };

  const icons = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6v1.5m0 3v1.5m0 3v1.5M6.75 6v1.5m0 3v1.5m0 3v1.5m13.5-9V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6z" /></svg>,
    categories: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.625 0c-.318 0-.622.126-.848.351l-1.426 1.426a.75.75 0 01-1.06 0l-1.426-1.426a1.207 1.207 0 00-.848-.351H2.25m19.5 0h-8.625" /></svg>,
    products: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25" /></svg>,
    toppings: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v1.607a2 2 0 01-1.006 1.738l-1.42.82a2 2 0 00-1 1.732v1.607m9.544-7.5l-1.42.82a2 2 0 00-1 1.732v1.607m1.218-3.337L15 2.104m-1.218 3.337a2 2 0 01-1.006 1.738l-1.42.82a2 2 0 00-1 1.732v1.607" /></svg>,
    orders: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" /></svg>,
    vouchers: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    reviews: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
    payments: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75-3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5h15a2.25 2.25 0 002.25-2.25V14.25" /></svg>,
    contacts: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
    // 👇 THÊM ICON LOG HOẠT ĐỘNG
    activityLogs: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  };

  const menuItems = [
    { path: '/admin', icon: icons.dashboard, label: 'Tổng Quan' },
    { path: '/admin/categories', icon: icons.categories, label: 'Quản Lý Danh Mục' },
    { path: '/admin/products', icon: icons.products, label: 'Quản Lý Sản Phẩm' },
    { path: '/admin/toppings', icon: icons.toppings, label: 'Quản Lý Topping' },
    { path: '/admin/orders', icon: icons.orders, label: 'Đơn Hàng & Chi Tiết' },
    { path: '/admin/vouchers', icon: icons.vouchers, label: 'Mã Khuyến Mãi' },
    { path: '/admin/users', icon: icons.users, label: 'Người Dùng & Quyền' },
    { path: '/admin/reviews', icon: icons.reviews, label: 'Đánh Giá (Reviews)' },
    { path: '/admin/payments', icon: icons.payments, label: 'Giao Dịch (Payments)' },
    { path: '/admin/contacts', icon: icons.contacts, label: 'Hòm Thư Liên Hệ' },
    // 👇 THÊM ĐƯỜNG DẪN VÀO MENU 
    { path: '/admin/activity-logs', icon: icons.activityLogs, label: 'Nhật Ký Hoạt Động' }, 
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-gray-900 text-white flex flex-col shadow-2xl z-20 overflow-hidden">
        <div className="p-8 text-3xl font-black border-b border-gray-800 text-center tracking-tighter italic">
          Hieu<span className="text-blue-500 underline decoration-4 underline-offset-8">Store</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 font-bold group ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-blue-500'}`}>
                    {item.icon}
                </div>
                <span className="text-sm tracking-wide">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-6 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 text-red-500 rounded-xl font-black hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            <span className="uppercase text-xs tracking-widest">Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between px-10 sticky top-0 z-10 border-b border-gray-100">
          <div className="flex items-center gap-4">
             <div className="w-1.5 h-8 bg-blue-600 rounded-full animate-pulse"></div>
             <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight italic">
                {menuItems.find(i => (location.pathname === i.path || (i.path !== '/admin' && location.pathname.startsWith(i.path))))?.label || "Hệ Thống Quản Trị"}
             </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block border-r border-gray-100 pr-6">
              <p className="text-sm font-black text-gray-800">Nguyen Duc Hieu</p>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">HieuStore Owner</p>
            </div>
            <div className="relative group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-black text-xl shadow-lg border-2 border-white transition-transform group-hover:rotate-6">
                H
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 bg-gray-50/50">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;