import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { fetchSiteSettings, fetchLayoutConfig, applyTheme } from "./redux/slices/settingsSlice";
import { fetchMe } from "./redux/slices/authSlice";
import { fetchCart } from "./redux/slices/cartSlice";

// Shop pages
import HomePage from "./pages/shop/HomePage";
import ProductsPage from "./pages/shop/ProductsPage";
import ProductDetailPage from "./pages/shop/ProductDetailPage";
import CartPage from "./pages/shop/CartPage";
import CheckoutPage from "./pages/shop/CheckoutPage";
import OrderSuccessPage from "./pages/shop/OrderSuccessPage";
import OrdersPage from "./pages/shop/OrdersPage";
import OrderDetailPage from "./pages/shop/OrderDetailPage";
import ProfilePage from "./pages/shop/ProfilePage";
import WishlistPage from "./pages/shop/WishlistPage";
import LoginPage from "./pages/shop/LoginPage";
import RegisterPage from "./pages/shop/RegisterPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminSiteSettings from "./pages/admin/AdminSiteSettings";
import AdminLayoutBuilder from "./pages/admin/AdminLayoutBuilder";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminPricing from "./pages/admin/AdminPricing";

// Layout
import ShopLayout from "./components/layout/ShopLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  const dispatch = useDispatch();
  const { site } = useSelector((state) => state.settings);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchSiteSettings());
    dispatch(fetchLayoutConfig());
  }, [dispatch]);

  useEffect(() => {
    if (site) dispatch(applyTheme());
  }, [site, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMe());
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: "var(--font-family)" } }} />
      <Routes>
        {/* Shop Routes */}
        <Route path="/" element={<ShopLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="order-success/:id" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute roles={["admin","super_admin"]}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="roles" element={<ProtectedRoute roles={["super_admin"]}><AdminRoles /></ProtectedRoute>} />
          <Route path="pricing" element={<ProtectedRoute roles={["super_admin"]}><AdminPricing /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute roles={["super_admin"]}><AdminSiteSettings /></ProtectedRoute>} />
          <Route path="layout" element={<ProtectedRoute roles={["super_admin"]}><AdminLayoutBuilder /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
