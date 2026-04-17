// =============================================
// ProfileInfo.tsx — View & Edit profile info
// =============================================

import { useState } from "react";
import axios from "axios";
import ProfileService from "../../services/profile.service";
import type { UserProfileDto } from "../../types/profile.types";

interface Props {
    profile: UserProfileDto;
    onUpdated: (updated: UserProfileDto) => void;
}

export default function ProfileInfo({ profile, onUpdated }: Props) {
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(profile.name);
    const [nameError, setNameError] = useState("");
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [serverError, setServerError] = useState("");

    const handleSave = async () => {
        if (!name.trim() || name.trim().length < 2) {
            setNameError("Name must be at least 2 characters.");
            return;
        }
        setSaving(true);
        setServerError("");
        setSuccessMsg("");
        try {
            const updated = await ProfileService.updateProfile({ name: name.trim() });
            onUpdated(updated);

            // localStorage এ user update করো
            const stored = localStorage.getItem("user");
            if (stored) {
                const user = JSON.parse(stored);
                user.name = updated.name;
                localStorage.setItem("user", JSON.stringify(user));
                window.dispatchEvent(new Event("authChanged")); // Navbar update
            }

            setSuccessMsg("Profile updated successfully!");
            setEditMode(false);
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setServerError(err.response?.data?.message || "Failed to update profile.");
            } else {
                setServerError("Something went wrong.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setName(profile.name);
        setNameError("");
        setServerError("");
        setEditMode(false);
    };

    const roleBadgeColor: Record<string, string> = {
        Admin: "danger",
        Vendor: "warning text-dark",
        Customer: "primary",
    };

    return (
        <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between">
                <h6 className="fw-bold mb-0">
                    <i className="bi bi-person-circle me-2 text-primary"></i>
                    Profile Information
                </h6>
                {!editMode && (
                    <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setEditMode(true)}
                    >
                        <i className="bi bi-pencil me-1"></i>Edit
                    </button>
                )}
            </div>

            <div className="card-body p-4">

                {successMsg && (
                    <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
                        <i className="bi bi-check-circle-fill"></i>
                        {successMsg}
                    </div>
                )}
                {serverError && (
                    <div className="alert alert-danger py-2 mb-3 small">{serverError}</div>
                )}

                {/* Avatar */}
                <div className="d-flex align-items-center gap-4 mb-4">
                    <div
                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                        style={{ width: "80px", height: "80px", fontSize: "32px" }}
                    >
                        {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h5 className="fw-bold mb-1">{profile.name}</h5>
                        <span className={`badge bg-${roleBadgeColor[profile.role] ?? "secondary"}`}>
                            {profile.role}
                        </span>
                    </div>
                </div>

                {/* Fields */}
                <div className="row g-3">

                    {/* Name */}
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted text-uppercase">
                            Full Name
                        </label>
                        {editMode ? (
                            <>
                                <input
                                    type="text"
                                    className={`form-control ${nameError ? "is-invalid" : ""}`}
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setNameError(""); }}
                                    maxLength={100}
                                    disabled={saving}
                                />
                                {nameError && <div className="invalid-feedback">{nameError}</div>}
                            </>
                        ) : (
                            <p className="fw-semibold mb-0">{profile.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted text-uppercase">
                            Email Address
                        </label>
                        <p className="fw-semibold mb-0">
                            {profile.email}
                            <i className="bi bi-lock-fill text-muted ms-2" style={{ fontSize: "12px" }} title="Cannot be changed"></i>
                        </p>
                    </div>

                    {/* Role */}
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted text-uppercase">
                            Role
                        </label>
                        <p className="mb-0">
                            <span className={`badge bg-${roleBadgeColor[profile.role] ?? "secondary"}`}>
                                {profile.role}
                            </span>
                        </p>
                    </div>

                    {/* Joined */}
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted text-uppercase">
                            Member Since
                        </label>
                        <p className="fw-semibold mb-0">
                            {new Date(profile.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </div>

                </div>

                {/* Edit Actions */}
                {editMode && (
                    <div className="d-flex gap-2 mt-4">
                        <button
                            className="btn btn-primary fw-semibold"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                            ) : (
                                <><i className="bi bi-check-lg me-2"></i>Save Changes</>
                            )}
                        </button>
                        <button
                            className="btn btn-outline-secondary"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}