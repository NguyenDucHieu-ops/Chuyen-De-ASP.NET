import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';

// Client Pages
import HomePage from './pages/client/home/HomePage';
import ProductsPage from './pages/client/products/ProductsPage';
import ProductDetailPage from './pages/client/products/ProductDetailPage';
import CartPage from './pages/client/cart/CartPage';
import ProfilePage from './pages/client/profile/ProfilePage';
import ContactPage from './pages/client/contact/ContactPage';
import PaymentResult from './pages/client/cart/PaymentResult'; 

// Auth & Admin
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/admin/dashboard/Dashboard';
import ProductManager from './pages/admin/products/ProductManager';
import CategoryManager from './pages/admin/categories/CategoryManager';
import OrderManager from './pages/admin/orders/OrderManager';
import ToppingManager from './pages/admin/toppings/ToppingManager';
import UserManager from './pages/admin/users/UserManager';
import VoucherManager from './pages/admin/vouchers/VoucherManager';
import ReviewManager from './pages/admin/reviews/ReviewManager';
import PaymentManager from './pages/admin/payments/PaymentManager';
import ContactManager from './pages/admin/contacts/ContactManager';

// Security Component
import ProtectedRoute from './components/ProtectedRoute'; // Nhớ check đúng đường dẫn file này nha sếp

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes: Đăng nhập/Đăng ký ai cũng vào được */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ================= GIAO DIỆN KHÁCH HÀNG ================= */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} /> 
          <Route path="product/:id" element={<ProductDetailPage />} /> 
          <Route path="cart" element={<CartPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="payment-result" element={<PaymentResult />} /> 
        </Route>
        
        {/* ================= GIAO DIỆN QUẢN TRỊ (ĐÃ KHÓA CHẶT) ================= */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} /> 
            <Route path="products" element={<ProductManager />} /> 
            <Route path="categories" element={<CategoryManager />} /> 
            <Route path="orders" element={<OrderManager />} /> 
            <Route path="toppings" element={<ToppingManager />} /> 
            <Route path="users" element={<UserManager />} /> 
            <Route path="vouchers" element={<VoucherManager />} /> 
            <Route path="reviews" element={<ReviewManager />} /> 
            <Route path="payments" element={<PaymentManager />} /> 
            <Route path="contacts" element={<ContactManager />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;