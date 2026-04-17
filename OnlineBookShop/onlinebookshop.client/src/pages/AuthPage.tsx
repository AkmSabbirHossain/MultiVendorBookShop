import { useState } from "react";
import { useNavigate } from "react-router-dom";   
import LoginForm from "../components/auth/Loginform";
import RegisterForm from "../components/auth/Registerform";

type Tab = "login" | "register";

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<Tab>("login");
    const [successMsg, setSuccessMsg] = useState("");
    const navigate = useNavigate();  

    const handleSuccess = (userName: string, role: string) => {
        setSuccessMsg(`Welcome, ${userName}! (${role})`);

        // According to role-- redirect
        if (role === "Admin") {
            navigate("/admin/dashboard", { replace: true });
        } else if (role === "Vendor") {
            navigate("/vendor/dashboard", { replace: true });
        } else {
            navigate("/", { replace: true }); 
        }
    };

    const switchTab = (tab: Tab) => {
        setActiveTab(tab);
        setSuccessMsg("");
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light" style={{ padding: "24px 16px" }}>
            <div className="w-100" style={{ maxWidth: "480px" }}>
                {/* Brand Header */}
                <div className="text-center mb-4">
                    <span style={{ fontSize: "40px" }}>📚</span>
                    <h1 className="h3 fw-bold mt-2 mb-1">Online Book Shop</h1>
                    <p className="text-muted small mb-0">Your curated literary world</p>
                </div>

                {/* Main Card */}
                <div className="card shadow border-0 rounded-4">
                    <div className="card-body p-4">
                        {successMsg && (
                            <div className="alert alert-success d-flex align-items-center gap-2 mb-3" role="alert">
                                <i className="bi bi-check-circle-fill"></i>
                                <span>{successMsg}</span>
                            </div>
                        )}

                        {/* Tabs */}
                        <ul className="nav nav-pills nav-fill mb-4 bg-light rounded-3 p-1">
                            <li className="nav-item">
                                <button
                                    className={`nav-link rounded-3 fw-semibold w-100 ${activeTab === "login" ? "active" : "text-muted"}`}
                                    onClick={() => switchTab("login")}
                                >
                                    <i className="bi bi-box-arrow-in-right me-1"></i>
                                    Sign In
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link rounded-3 fw-semibold w-100 ${activeTab === "register" ? "active" : "text-muted"}`}
                                    onClick={() => switchTab("register")}
                                >
                                    <i className="bi bi-person-plus me-1"></i>
                                    Register
                                </button>
                            </li>
                        </ul>

                        {/* Form Switcher */}
                        {activeTab === "login" ? (
                            <LoginForm
                                onSuccess={handleSuccess}
                                onSwitchToRegister={() => switchTab("register")}
                            />
                        ) : (
                            <RegisterForm
                                onSuccess={handleSuccess}
                                onSwitchToLogin={() => switchTab("login")}
                            />
                        )}
                    </div>
                </div>

                <p className="text-center text-muted mt-3" style={{ fontSize: "12px" }}>
                    &copy; {new Date().getFullYear()} Online Book Shop. All rights reserved.
                </p>
            </div>
        </div>
    );
}
