// =============================================
// VendorRegisterPage.tsx 
// POST /api/Vendor/register
// =============================================

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/common/Navbar";
import VendorService from "../services/vendor.service";

interface FormState {
    shopName: string;
    description: string;
    logoUrl: string;
}

interface FormErrors {
    shopName?: string;
    logoUrl?: string;
}

const EMPTY_FORM: FormState = {
    shopName: "",
    description: "",
    logoUrl: "",
};

export default function VendorRegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (field: keyof FormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        setServerError("");
    };

    // ── Validation ──
    const validate = (): boolean => {
        const errs: FormErrors = {};
        if (!form.shopName.trim()) {
            errs.shopName = "Shop name is required";
        } else if (form.shopName.trim().length < 3) {
            errs.shopName = "Shop name must be at least 3 characters";
        } else if (form.shopName.trim().length > 150) {
            errs.shopName = "Shop name cannot exceed 150 characters";
        }
        if (form.logoUrl.trim() && !/^https?:\/\/.+/.test(form.logoUrl.trim())) {
            errs.logoUrl = "Please enter a valid URL (https://...)";
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
            await VendorService.registerVendor({
                shopName: form.shopName.trim(),
                description: form.description.trim() || undefined,
                logoUrl: form.logoUrl.trim() || undefined,
            });
            setSuccess(true);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setServerError(
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    "Registration failed. Please try again."
                );
            } else {
                setServerError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // =============================================
    // SUCCESS STATE
    // =============================================
    if (success) {
        return (
            <>
                <Navbar />
                <div className="bg-light min-vh-100 py-5">
                    <div className="container" style={{ maxWidth: "560px" }}>
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-5 text-center">

                                <div
                                    className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-4"
                                    style={{ width: "90px", height: "90px" }}
                                >
                                    <i
                                        className="bi bi-hourglass-split text-success"
                                        style={{ fontSize: "40px" }}
                                    ></i>
                                </div>

                                <h4 className="fw-bold mb-2">Registration Submitted!</h4>
                                <p className="text-muted mb-4">
                                    Your vendor registration request has been submitted successfully.
                                    Please wait for admin approval before adding books.
                                </p>

                                <div className="alert alert-info d-flex align-items-start gap-2 text-start mb-4">
                                    <i className="bi bi-info-circle-fill mt-1 flex-shrink-0"></i>
                                    <div>
                                        <strong>What happens next?</strong>
                                        <ul className="mb-0 mt-1 small">
                                            <li>An admin will review your request</li>
                                            <li>Once approved, you will get access to the Vendor Dashboard</li>
                                            <li>You can then start adding and selling books</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="d-flex gap-3 justify-content-center">
                                    <Link to="/" className="btn btn-primary px-4">
                                        <i className="bi bi-house me-2"></i>Go to Home
                                    </Link>
                                    <button
                                        className="btn btn-outline-secondary px-4"
                                        onClick={() => navigate("/vendor/dashboard")}
                                    >
                                        <i className="bi bi-shop me-2"></i>My Dashboard
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // =============================================
    // REGISTRATION FORM
    // =============================================
    return (
        <>
            <Navbar />

            <div className="bg-light min-vh-100 py-5">
                <div className="container" style={{ maxWidth: "600px" }}>

                    {/* Header */}
                    <div className="text-center mb-4">
                        <div
                            className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3"
                            style={{ width: "70px", height: "70px" }}
                        >
                            <i className="bi bi-shop text-primary" style={{ fontSize: "32px" }}></i>
                        </div>
                        <h3 className="fw-bold mb-1">Become a Vendor</h3>
                        <p className="text-muted">
                            Register your shop and start selling books today
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-4 p-md-5">

                            {/* Server Error */}
                            {serverError && (
                                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                    {serverError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} noValidate>

                                {/* Shop Name */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Shop Name <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="bi bi-shop"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.shopName
                                                    ? "is-invalid"
                                                    : form.shopName
                                                        ? "is-valid"
                                                        : ""
                                                }`}
                                            placeholder="Enter your shop name"
                                            value={form.shopName}
                                            onChange={(e) => handleChange("shopName", e.target.value)}
                                            maxLength={150}
                                            disabled={loading}
                                        />
                                        {errors.shopName && (
                                            <div className="invalid-feedback">{errors.shopName}</div>
                                        )}
                                    </div>
                                    <small className="text-muted">{form.shopName.length}/150</small>
                                </div>

                                {/* Description */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Description{" "}
                                        <span className="text-muted fw-normal">(optional)</span>
                                    </label>
                                    <textarea
                                        className="form-control"
                                        placeholder="Tell customers about your shop..."
                                        rows={4}
                                        value={form.description}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        maxLength={500}
                                        disabled={loading}
                                    />
                                    <small className="text-muted">{form.description.length}/500</small>
                                </div>

                                {/* Logo URL */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        Logo URL{" "}
                                        <span className="text-muted fw-normal">(optional)</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="bi bi-image"></i>
                                        </span>
                                        <input
                                            type="url"
                                            className={`form-control ${errors.logoUrl ? "is-invalid" : ""}`}
                                            placeholder="https://example.com/logo.png"
                                            value={form.logoUrl}
                                            onChange={(e) => handleChange("logoUrl", e.target.value)}
                                            disabled={loading}
                                        />
                                        {errors.logoUrl && (
                                            <div className="invalid-feedback">{errors.logoUrl}</div>
                                        )}
                                    </div>
                                    {/* Logo Preview */}
                                    {form.logoUrl && !errors.logoUrl && (
                                        <div className="mt-2">
                                            <img
                                                src={form.logoUrl}
                                                alt="Logo preview"
                                                className="rounded border"
                                                style={{ height: "60px", objectFit: "contain" }}
                                                onError={(e) => (e.currentTarget.style.display = "none")}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Info Box */}
                                <div className="alert alert-light border d-flex align-items-start gap-2 mb-4">
                                    <i className="bi bi-info-circle text-primary mt-1 flex-shrink-0"></i>
                                    <div className="small text-muted">
                                        After submitting your registration, an admin will review
                                        your request. Once approved, you will be able to add and
                                        manage books from your Vendor Dashboard.
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2 fw-bold"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send me-2"></i>
                                            Submit Registration
                                        </>
                                    )}
                                </button>

                            </form>
                        </div>
                    </div>

                    {/* Back Link */}
                    <p className="text-center text-muted mt-3 small">
                        <Link to="/" className="text-decoration-none">
                            <i className="bi bi-arrow-left me-1"></i>
                            Back to Home
                        </Link>
                    </p>

                </div>
            </div>
        </>
    );
}