// =============================================
// VendorDashboardPage.tsx — Updated: Orders tab added
// =============================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/common/Navbar";
import VendorStats from "../components/vendor/VendorStats";
import BookTable from "../components/vendor/BookTable";
import BookFormModal from "../components/vendor/BookFormModal";
import VendorOrders from "../components/vendor/VendorOrders";
import VendorService from "../services/vendor.service";
import BookService from "../services/book.service";
import OrderService from "../services/order.service";
import type { VendorResponseDto } from "../types/vendor.types";
import type {
    BookResponseDto,
    BookCreateDto,
    BookUpdateDto,
    CategoryResponseDto,
} from "../types/book.types";
import type { OrderResponseDto, OrderStatus } from "../types/order.types";

type Tab = "books" | "orders";

export default function VendorDashboardPage() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<Tab>("books");
    const [vendor, setVendor] = useState<VendorResponseDto | null>(null);
    const [books, setBooks] = useState<BookResponseDto[]>([]);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [orders, setOrders] = useState<OrderResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editBook, setEditBook] = useState<BookResponseDto | null>(null);
    const [saving, setSaving] = useState(false);

    // Delete state
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Toast
    const [toast, setToast] = useState<{ msg: string; type: "success" | "danger" } | null>(null);

    const showToast = (msg: string, type: "success" | "danger" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Fetch all data ──
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            setError("");
            try {
                const [vendorData, booksData, catsData] = await Promise.all([
                    VendorService.getMyProfile(),
                    VendorService.getMyBooks(),
                    BookService.getCategories(),
                ]);
                setVendor(vendorData);
                setBooks(booksData);
                setCategories(catsData);

                // Orders fetch — approved vendor 
                if (vendorData.isApproved) {
                    const ordersData = await OrderService.getVendorOrders();
                    setOrders(ordersData);
                }
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    const status = err.response?.status;
                    if (status === 404) {
                        setError("vendor_not_registered");
                    } else {
                        setError(err.response?.data?.message || "Data load failed.");
                    }
                } else {
                    setError("Something went wrong.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // ── Order status update ──
    const handleStatusUpdated = (orderId: number, newStatus: OrderStatus) => {
        setOrders((prev) =>
            prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
        );
        showToast(`Order #${orderId} status updated to ${newStatus}! ✅`);
    };

    // ── Book handlers ──
    const handleOpenAdd = () => {
        setEditBook(null);
        setShowModal(true);
    };

    const handleOpenEdit = (book: BookResponseDto) => {
        setEditBook(book);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (saving) return;
        setShowModal(false);
        setEditBook(null);
    };

    const handleSubmit = async (dto: BookCreateDto | BookUpdateDto) => {
        setSaving(true);
        try {
            if (editBook) {
                const updated = await VendorService.updateBook(editBook.bookId, dto as BookUpdateDto);
                setBooks((prev) =>
                    prev.map((b) => (b.bookId === editBook.bookId ? updated : b))
                );
                showToast("Book updated successfully! ✅");
            } else {
                const created = await VendorService.createBook(dto as BookCreateDto);
                setBooks((prev) => [created, ...prev]);
                showToast("Book added successfully! 📚");
            }
            setShowModal(false);
            setEditBook(null);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                showToast(
                    err.response?.data?.message || "Something went wrong.",
                    "danger"
                );
            } else {
                showToast("Something went wrong.", "danger");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (bookId: number) => {
        if (!window.confirm("Delete this book?")) return;
        setDeletingId(bookId);
        try {
            await VendorService.deleteBook(bookId);
            setBooks((prev) => prev.filter((b) => b.bookId !== bookId));
            showToast("Book deleted. 🗑️");
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                showToast(err.response?.data?.message || "Delete failed.", "danger");
            } else {
                showToast("Something went wrong.", "danger");
            }
        } finally {
            setDeletingId(null);
        }
    };

    // ── Pending orders count ──
    const pendingOrdersCount = orders.filter((o) => o.status === "Pending").length;

    // =============================================
    // RENDER
    // =============================================
    return (
        <>
            <Navbar />

            <div className="bg-light min-vh-100 py-4">
                <div className="container-xl">

                    {/* Loading */}
                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
                            <p className="text-muted mt-3">Loading dashboard...</p>
                        </div>
                    )}

                    {/* Vendor Not Registered */}
                    {!loading && error === "vendor_not_registered" && (
                        <div className="text-center py-5">
                            <div style={{ fontSize: "70px" }}>🏪</div>
                            <h4 className="fw-bold mt-3">You are not registered as a Vendor</h4>
                            <p className="text-muted mb-4">
                                Register as a vendor to start selling books.
                            </p>
                            <button
                                className="btn btn-primary btn-lg px-5"
                                onClick={() => navigate("/vendor/register")}
                            >
                                <i className="bi bi-shop me-2"></i>Register as Vendor
                            </button>
                        </div>
                    )}

                    {/* Vendor Not Approved */}
                    {!loading && vendor && !vendor.isApproved && (
                        <div className="alert alert-warning d-flex align-items-center gap-3 mb-4">
                            <i className="bi bi-hourglass-split fs-4"></i>
                            <div>
                                <strong>Your vendor account is pending approval.</strong>
                                <p className="mb-0 small text-muted">
                                    You can add books after admin approval.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* General Error */}
                    {!loading && error && error !== "vendor_not_registered" && (
                        <div className="alert alert-danger d-flex align-items-center gap-2">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            {error}
                        </div>
                    )}

                    {/* Dashboard Content */}
                    {!loading && vendor && (
                        <>
                            {/* Header */}
                            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                                <div>
                                    <h4 className="fw-bold mb-0">
                                        <i className="bi bi-shop me-2 text-primary"></i>
                                        {vendor.shopName}
                                    </h4>
                                    <p className="text-muted small mb-0">Vendor Dashboard</p>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span
                                        className={`badge fs-6 ${vendor.isApproved
                                                ? "bg-success-subtle text-success-emphasis"
                                                : "bg-warning-subtle text-warning-emphasis"
                                            }`}
                                    >
                                        <i className={`bi me-1 ${vendor.isApproved ? "bi-patch-check-fill" : "bi-hourglass-split"}`}></i>
                                        {vendor.isApproved ? "Approved" : "Pending"}
                                    </span>
                                    {vendor.isApproved && (
                                        <button className="btn btn-success fw-semibold" onClick={handleOpenAdd}>
                                            <i className="bi bi-plus-lg me-2"></i>Add Book
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <VendorStats books={books} />

                            {/* Tabs */}
                            <ul className="nav nav-tabs mb-4">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link fw-semibold ${activeTab === "books" ? "active" : ""}`}
                                        onClick={() => setActiveTab("books")}
                                    >
                                        <i className="bi bi-book me-2"></i>
                                        My Books
                                        <span className="badge bg-primary ms-2">{books.length}</span>
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link fw-semibold ${activeTab === "orders" ? "active" : ""}`}
                                        onClick={() => setActiveTab("orders")}
                                    >
                                        <i className="bi bi-bag me-2"></i>
                                        Orders
                                        <span className="badge bg-primary ms-2">{orders.length}</span>
                                        {pendingOrdersCount > 0 && (
                                            <span className="badge bg-warning text-dark ms-1">
                                                {pendingOrdersCount} pending
                                            </span>
                                        )}
                                    </button>
                                </li>
                            </ul>

                            {/* Tab Content */}
                            {activeTab === "books" && (
                                <BookTable
                                    books={books}
                                    onEdit={handleOpenEdit}
                                    onDelete={handleDelete}
                                    deletingId={deletingId}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                />
                            )}

                            {activeTab === "orders" && (
                                <VendorOrders
                                    orders={orders}
                                    onStatusUpdated={handleStatusUpdated}
                                />
                            )}
                        </>
                    )}

                </div>
            </div>

            {/* Book Form Modal */}
            <BookFormModal
                show={showModal}
                editBook={editBook}
                categories={categories}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                saving={saving}
            />

            {/* Toast */}
            {toast && (
                <div
                    className={`position-fixed bottom-0 end-0 m-4 alert alert-${toast.type} shadow d-flex align-items-center gap-2`}
                    style={{ zIndex: 9999, minWidth: "260px" }}
                >
                    <i className={`bi fs-5 ${toast.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
                    {toast.msg}
                </div>
            )}
        </>
    );
}