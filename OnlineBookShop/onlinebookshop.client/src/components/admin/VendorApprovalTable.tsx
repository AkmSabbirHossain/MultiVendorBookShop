// =============================================
// VendorApprovalTable.tsx — Pending vendor list
// =============================================

import type { VendorResponseDto } from "../../types/admin.types";

interface Props {
    vendors: VendorResponseDto[];
    onApprove: (vendorId: number) => void;
    onReject: (vendorId: number) => void;
    processingId: number | null;
}

export default function VendorApprovalTable({
    vendors,
    onApprove,
    onReject,
    processingId,
}: Props) {
    return (
        <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between">
                <h6 className="fw-bold mb-0">
                    <i className="bi bi-hourglass-split me-2 text-warning"></i>
                    Pending Vendor Approvals
                    {vendors.length > 0 && (
                        <span className="badge bg-warning text-dark ms-2 rounded-pill">
                            {vendors.length}
                        </span>
                    )}
                </h6>
            </div>

            <div className="card-body p-0">
                {vendors.length === 0 ? (
                    <div className="text-center py-5">
                        <div style={{ fontSize: "48px" }}>✅</div>
                        <p className="text-muted mt-2">There is no pending vendor.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Vendor ID</th>
                                    <th>Shop Name</th>
                                    <th>Description</th>
                                    <th>User ID</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendors.map((vendor) => (
                                    <tr key={vendor.vendorId}>
                                        <td>
                                            <span className="badge bg-secondary">#{vendor.vendorId}</span>
                                        </td>

                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                {vendor.logoUrl ? (
                                                    <img
                                                        src={vendor.logoUrl}
                                                        alt={vendor.shopName}
                                                        className="rounded"
                                                        style={{ width: "36px", height: "36px", objectFit: "cover" }}
                                                        onError={(e) => (e.currentTarget.style.display = "none")}
                                                    />
                                                ) : (
                                                    <div
                                                        className="rounded bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                                                        style={{ width: "36px", height: "36px" }}
                                                    >
                                                        <i className="bi bi-shop text-primary"></i>
                                                    </div>
                                                )}
                                                <span className="fw-semibold">{vendor.shopName}</span>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="text-muted small">
                                                {vendor.description || "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="text-muted small">User #{vendor.userId}</span>
                                        </td>

                                        <td className="text-end">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button
                                                    className="btn btn-success btn-sm fw-semibold"
                                                    onClick={() => onApprove(vendor.vendorId)}
                                                    disabled={processingId === vendor.vendorId}
                                                >
                                                    {processingId === vendor.vendorId ? (
                                                        <span className="spinner-border spinner-border-sm" />
                                                    ) : (
                                                        <><i className="bi bi-check-lg me-1"></i>Approve</>
                                                    )}
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => onReject(vendor.vendorId)}
                                                    disabled={processingId === vendor.vendorId}
                                                >
                                                    <i className="bi bi-x-lg me-1"></i>Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}