// =============================================
// App.tsx — Full routing setup
// =============================================

import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { useEffect } from "react";

// ── Pages ──
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import OrdersPage from "./pages/OrdersPage";
import VendorRegisterPage from "./pages/VendorRegisterPage";
import BookDetailPage from "./pages/BookDetailPage";
import ProfilePage from "./pages/ProfilePage";

// ── Services ──
import AuthService from "./services/auth.service";

// =============================================
// ROUTE GUARDS
// =============================================

//Not Login  /auth redirect
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    return AuthService.isAuthenticated() ? <>{children}</> : <Navigate to="/auth" replace />;
}

// Role base access control
function RoleRoute({
    children,
    allowedRoles,
}: {
    children: React.ReactNode;
    allowedRoles: string[];
}) {
    const user = AuthService.getCurrentUser();
    if (!user) return <Navigate to="/auth" replace />;
    if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
    return <>{children}</>;
}

// Login 
function GuestRoute({ children }: { children: React.ReactNode }) {
    return AuthService.isAuthenticated() ? <Navigate to="/" replace /> : <>{children}</>;
}

// =============================================
// PLACEHOLDER PAGES 
// =============================================


//function AdminDashboardPage() {
//    return (
//        <div className="container mt-5 text-center">
//            <h2>👑 Admin Dashboard</h2>
//            <p className="text-muted">Admin panel </p>
//        </div>
//    );
//}

function NotFoundPage() {
    return (
        <div className="container mt-5 text-center">
            <h1 className="display-1 fw-bold text-muted">404</h1>
            <p className="lead">Does not found this Page</p>
            <a href="/" className="btn btn-primary">Goback to Home </a>
        </div>
    );
}

//logout
function LogoutPage() {
    const navigate = useNavigate();
    useEffect(() => {
        AuthService.logout();
        navigate("/auth", { replace: true });
    }, [navigate]);

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" />
                <p className="text-muted">Logging out...</p>
            </div>
        </div>
    );
}
// =============================================
// MAIN APP
// =============================================
export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ── Public: Login ── */}
                <Route
                    path="/auth"
                    element={
                        <GuestRoute>
                            <AuthPage />
                        </GuestRoute>
                    }
                />
                {/* /login ও /register → AuthPage redirect */}
                <Route
                    path="/login"
                    element={<Navigate to="/auth" replace />}
                />

                <Route path="/register" element={<Navigate to="/auth" replace />} />

                {/* ── Customer Routes ── */}
                <Route path="/" element={<HomePage />} />

                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute>
                            <CartPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute>
                            <CheckoutPage />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <OrdersPage />
                        </ProtectedRoute>
                    }
                />
              

                <Route path="/books/:id" element={<BookDetailPage />} />

                {/* ── Vendor Routes ── */}
                <Route
                    path="/vendor/dashboard"
                    element={
                        <RoleRoute allowedRoles={["Vendor"]}>
                            <VendorDashboardPage />
                        </RoleRoute>
                    }
                />

                {/* ── VendorRegistraionPage  ── */}

                <Route
                    path="/vendor/register"
                    element={
                        <ProtectedRoute>
                            <VendorRegisterPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="/logout" element={<LogoutPage />} />

                {/* ── Admin Routes ── */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <RoleRoute allowedRoles={["Admin"]}>
                            <AdminDashboardPage />
                        </RoleRoute>
                    }
                />
            

                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />



                {/* ── Fallback ── */}
                <Route path="*" element={<NotFoundPage />} />



            </Routes>

        </BrowserRouter>
    );
}