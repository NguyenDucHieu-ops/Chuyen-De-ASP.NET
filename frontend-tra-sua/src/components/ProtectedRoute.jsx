import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('hieu_store_token');

  const isAdmin = () => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check cả 2 trường hợp key role để tránh lỗi thiếu hụt từ Backend
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
      return role === 'Admin';
    } catch {
      // Bỏ (e) đi nếu không dùng đến nó, ESLint sẽ hết báo lỗi
      return false;
    }
  };

  return isAdmin() ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;