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
import ArticlesPage from './pages/client/articles/ArticlesPage';
import ArticleDetailPage from './pages/client/articles/ArticleDetailPage';
import AllReviewsPage from './pages/client/AllReviewsPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import LuckyWheelPage from './pages/client/lucky-wheel/LuckyWheelPage';
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
import RewardManager from './pages/admin/rewards/RewardManager';
// Quản lý Mới
import ActivityLogManager from "./components/ActivityLogManager";
import ArticleManager from "./pages/admin/articles/ArticleManager"; 
import BannerManager from "./pages/admin/banners/BannerManager"; // 👈 IMPORT BANNER
import NotificationPage from './components/NotificationPage'; // 👈 IMPORT TRANG THÔNG BÁO

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* CLIENT ROUTES */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} /> 
          <Route path="product/:id" element={<ProductDetailPage />} /> 
          <Route path="cart" element={<CartPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="payment-result" element={<PaymentResult />} /> 
          <Route path="articles" element={<ArticlesPage />} /> 
          <Route path="article/:id" element={<ArticleDetailPage />} /> 
          <Route path="/reviews" element={<AllReviewsPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/lucky-wheel" element={<LuckyWheelPage />} />
<Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/notifications" element={<NotificationPage />} /> {/* 👈 ROUTE THÔNG BÁO */}
        </Route>
        
        {/* ADMIN ROUTES */}
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
            <Route path="articles" element={<ArticleManager />} />
            <Route path="rewards" element={<RewardManager />} />
            <Route path="activity-logs" element={<ActivityLogManager />} />
            <Route path="banners" element={<BannerManager />} /> {/* 👈 GẮN ROUTE BANNER */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;