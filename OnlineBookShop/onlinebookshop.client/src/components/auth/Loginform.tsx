// =============================================
// LoginForm.tsx

// =============================================

import { useState } from "react";
import axios from "axios";
import AuthService from "../../services/auth.service";
import type { UserLoginDto } from "../../types/auth.types";

interface Props {
    onSuccess: (userName: string, role: string) => void;
    onSwitchToRegister: () => void;
}

interface FormErrors {
    email?: string;
    password?: string;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: Props) {
    const [form, setForm] = useState<UserLoginDto>({ email: "", password: "" });
    const [errors, setErrors] = useState<FormErrors>({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ── Field update ──
    const handleChange = (field: keyof UserLoginDto, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        setServerError("");
    };

    // ── Validation ──
    const validate = (): boolean => {
        const errs: FormErrors = {};
        if (!form.email) {
            errs.email = "Give your Email";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            errs.email = "Give valid email";
        }
        if (!form.password) {
            errs.password = "Give your Password";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Submit ──
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setServerError("");

        try {
            const data = await AuthService.login(form);
            AuthService.saveSession(data);
            onSuccess(data.user.name, data.user.role);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setServerError(err.response?.data?.message || "Login failed. Try again.");
            } else {
                setServerError("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>

            {/* Server Error */}
            {serverError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <span>{serverError}</span>
                </div>
            )}

            {/* Email */}
            <div className="mb-3">
                <label htmlFor="login-email" className="form-label fw-semibold">
                    Email Address
                </label>
                <div className="input-group">
                    <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                    </span>
                    <input
                        id="login-email"
                        type="email"
                        className={`form-control ${errors.email ? "is-invalid" : form.email ? "is-valid" : ""}`}
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        autoComplete="email"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
            </div>

            {/* Password */}
            <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                    <label htmlFor="login-password" className="form-label fw-semibold mb-0">
                        Password
                    </label>
                    <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-decoration-none"
                        style={{ fontSize: "13px" }}
                    >
                        Forgot password?
                    </button>
                </div>
                <div className="input-group mt-1">
                    <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                    </span>
                    <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword((p) => !p)}
                        tabIndex={-1}
                    >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>
            </div>

            {/* Remember Me */}
            <div className="mb-4 form-check">
                <input type="checkbox" className="form-check-input" id="rememberMe" />
                <label className="form-check-label text-muted" htmlFor="rememberMe" style={{ fontSize: "14px" }}>
                    Remember me
                </label>
            </div>

            {/* Submit */}
            <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-bold"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Signing in...
                    </>
                ) : (
                    <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Sign In
                    </>
                )}
            </button>

            {/* Switch to Register */}
            <hr className="my-4" />
            <p className="text-center text-muted mb-0" style={{ fontSize: "14px" }}>
                Don't have an account?{" "}
                <button
                    type="button"
                    className="btn btn-link p-0 fw-semibold"
                    onClick={onSwitchToRegister}
                >
                    Create one
                </button>
            </p>
        </form>
    );
}