import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";

import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import AdminOrders from "./pages/admin/AdminOrders";

import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import SessionWatcher from "./components/SessionWatcher";

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    <ToastProvider>
                        <BrowserRouter>
                            <Navbar />
                            <SessionWatcher />

                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<Products />} />
                                <Route path="/products" element={<Products />} />
                                <Route path="/products/:id" element={<ProductDetails />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/login" element={<Login />} />

                                {/* Protected Customer Routes */}
                                <Route
                                    path="/cart"
                                    element={
                                        <ProtectedRoute>
                                            <Cart />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/checkout"
                                    element={
                                        <ProtectedRoute>
                                            <Checkout />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/order-success"
                                    element={
                                        <ProtectedRoute>
                                            <OrderSuccess />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/orders"
                                    element={
                                        <ProtectedRoute>
                                            <Orders />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/orders/:id"
                                    element={
                                        <ProtectedRoute>
                                            <OrderDetails />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/wishlist"
                                    element={
                                        <ProtectedRoute>
                                            <Wishlist />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/account"
                                    element={
                                        <ProtectedRoute>
                                            <Account />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Protected Admin Routes — share a sidebar layout */}
                                <Route
                                    path="/admin"
                                    element={
                                        <ProtectedRoute adminOnly={true}>
                                            <AdminLayout />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    <Route path="products" element={<AdminProducts />} />
                                    <Route path="products/add" element={<AddProduct />} />
                                    <Route path="products/edit/:id" element={<EditProduct />} />
                                    <Route path="orders" element={<AdminOrders />} />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </ToastProvider>
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
