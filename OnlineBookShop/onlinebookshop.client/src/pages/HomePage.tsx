// =============================================
// HomePage.tsx — 
// =============================================

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/common/Navbar";
import BookCard from "../components/books/BookCard";
import BookFilter from "../components/books/BookFilter";
import BookService from "../services/book.service";
import CartService from "../services/cart.service";
import AuthService from "../services/auth.service";
import type {
    BookResponseDto,
    CategoryResponseDto,
    BookFilterParams,
} from "../types/book.types";

const PAGE_SIZE = 12;

const DEFAULT_FILTERS: BookFilterParams = {
    search: undefined,
    categoryId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: undefined,
    page: 1,
    pageSize: PAGE_SIZE,
};

export default function HomePage() {
    const navigate = useNavigate();

    const [allBooks, setAllBooks] = useState<BookResponseDto[]>([]);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [filters, setFilters] = useState<BookFilterParams>(DEFAULT_FILTERS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [cartMessage, setCartMessage] = useState("");
    const [cartError, setCartError] = useState("");
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // ── Cart quantities: { bookId: quantity } ──
    const [cartQuantities, setCartQuantities] = useState<Record<number, number>>({});

    // ── Fetch all books ──
    const fetchBooks = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await BookService.getBooks();
            setAllBooks(data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Failed to load books.");
            } else {
                setError("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Fetch cart quantities (login ) ──
    const fetchCartQuantities = async () => {
        if (!AuthService.isAuthenticated()) return;
        try {
            const cart = await CartService.getMyCart();
            const quantities: Record<number, number> = {};
            cart.items.forEach((item) => {
                quantities[item.bookId] = item.quantity;
            });
            setCartQuantities(quantities);
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        fetchBooks();
        BookService.getCategories()
            .then(setCategories)
            .catch(() => { });
        fetchCartQuantities();
    }, []);

    // ── Cart update event  quantities refresh ──
    useEffect(() => {
        const handleCartUpdate = () => {
            fetchCartQuantities();
        };
        window.addEventListener("cartUpdated", handleCartUpdate);
        return () => window.removeEventListener("cartUpdated", handleCartUpdate);
    }, []);

    // ── Frontend filtering ──
    const filteredBooks = useMemo(() => {
        let result = [...allBooks];

        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(
                (b) =>
                    b.title.toLowerCase().includes(q) ||
                    b.author.toLowerCase().includes(q)
            );
        }
        if (filters.categoryId !== undefined) {
            result = result.filter((b) => b.categoryId === filters.categoryId);
        }
        if (filters.minPrice !== undefined) {
            result = result.filter((b) => b.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
            result = result.filter((b) => b.price <= filters.maxPrice!);
        }
        switch (filters.sortBy) {
            case "price_asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price_desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "newest":
                result.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                break;
            case "title_asc":
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        return result;
    }, [allBooks, filters]);

    // ── Frontend pagination ──
    const currentPage = filters.page ?? 1;
    const totalCount = filteredBooks.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const paginatedBooks = filteredBooks.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handleFilterChange = (newFilters: BookFilterParams) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handleReset = () => setFilters(DEFAULT_FILTERS);

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const q = (fd.get("search") as string).trim();
        setFilters((prev) => ({ ...prev, search: q || undefined, page: 1 }));
    };

    // ── Add to Cart ──
    const handleAddToCart = async (bookId: number) => {
        if (!AuthService.isAuthenticated()) {
            navigate("/auth");
            return;
        }

        setAddingToCart(bookId);
        setCartError("");
        setCartMessage("");
        try {
            await CartService.addItem({ bookId, quantity: 1 });
            setCartMessage("Book added to cart!");
            setTimeout(() => setCartMessage(""), 2500);

            // Cart quantity locally update 
            setCartQuantities((prev) => ({
                ...prev,
                [bookId]: (prev[bookId] ?? 0) + 1,
            }));

            // Navbar cart count update
            window.dispatchEvent(new Event("cartUpdated"));

        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setCartError(
                    err.response?.data?.message || "Failed to add to cart."
                );
            } else {
                setCartError("Something went wrong.");
            }
            setTimeout(() => setCartError(""), 3000);
        } finally {
            setAddingToCart(null);
        }
    };

    const handleAddToWishlist = (bookId: number) => {
        if (!AuthService.isAuthenticated()) {
            navigate("/auth");
            return;
        }
        console.log("Wishlist:", bookId);
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const getPaginationPages = (): (number | "...")[] => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            for (
                let i = Math.max(2, currentPage - 1);
                i <= Math.min(totalPages - 1, currentPage + 1);
                i++
            ) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <>
            <Navbar />

            <div className="bg-light min-vh-100">

                {/* Hero */}
                <div className="bg-dark text-white py-4">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                <h1 className="display-6 fw-bold mb-1">
                                    Discover Your Next Book
                                </h1>
                                <p className="text-white-50 mb-3">
                                    Thousands of titles across every genre
                                </p>
                                <form onSubmit={handleSearchSubmit}>
                                    <div className="input-group input-group-lg" style={{ maxWidth: "500px" }}>
                                        <input
                                            type="search"
                                            name="search"
                                            className="form-control"
                                            placeholder="Search by title or author..."
                                            defaultValue={filters.search ?? ""}
                                        />
                                        <button className="btn btn-warning fw-semibold" type="submit">
                                            <i className="bi bi-search me-1"></i>Search
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className="col-lg-6 text-end d-none d-lg-block">
                                <span style={{ fontSize: "80px", opacity: 0.15 }}>📖</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Toast */}
                {cartMessage && (
                    <div
                        className="position-fixed bottom-0 end-0 m-4 alert alert-success shadow d-flex align-items-center gap-2"
                        style={{ zIndex: 9999, minWidth: "260px" }}
                    >
                        <i className="bi bi-check-circle-fill fs-5"></i>
                        {cartMessage}
                    </div>
                )}

                {/* Error Toast */}
                {cartError && (
                    <div
                        className="position-fixed bottom-0 end-0 m-4 alert alert-danger shadow d-flex align-items-center gap-2"
                        style={{ zIndex: 9999, minWidth: "260px" }}
                    >
                        <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                        {cartError}
                    </div>
                )}

                <div className="container py-4">
                    <div className="row g-4">

                        {/* Sidebar */}
                        <div className="col-lg-3 col-md-4">
                            <BookFilter
                                categories={categories}
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onReset={handleReset}
                                totalCount={totalCount}
                            />
                        </div>

                        {/* Books */}
                        <div className="col-lg-9 col-md-8">

                            {/* Top Bar */}
                            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                                <div>
                                    {filters.search && (
                                        <span className="text-muted small">
                                            Results for: <strong>"{filters.search}"</strong>
                                            <button
                                                className="btn btn-link btn-sm text-danger p-0 ms-2"
                                                onClick={() =>
                                                    setFilters((p) => ({ ...p, search: undefined, page: 1 }))
                                                }
                                            >
                                                <i className="bi bi-x-circle"></i>
                                            </button>
                                        </span>
                                    )}
                                </div>
                                <div className="btn-group btn-group-sm">
                                    <button
                                        className={`btn ${viewMode === "grid" ? "btn-dark" : "btn-outline-dark"}`}
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <i className="bi bi-grid-3x3-gap"></i>
                                    </button>
                                    <button
                                        className={`btn ${viewMode === "list" ? "btn-dark" : "btn-outline-dark"}`}
                                        onClick={() => setViewMode("list")}
                                    >
                                        <i className="bi bi-list-ul"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="alert alert-danger d-flex align-items-center gap-2">
                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                    {error}
                                    <button className="btn btn-link btn-sm ms-auto p-0" onClick={fetchBooks}>
                                        Retry
                                    </button>
                                </div>
                            )}

                            {/* Skeleton */}
                            {loading && (
                                <div className="row g-3">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={viewMode === "grid" ? "col-sm-6 col-xl-4" : "col-12"}
                                        >
                                            <div className="card border-0 shadow-sm rounded-3 placeholder-glow">
                                                <div className="placeholder rounded-top" style={{ height: "220px" }}></div>
                                                <div className="card-body">
                                                    <p className="placeholder col-8 mb-2"></p>
                                                    <p className="placeholder col-5 mb-3"></p>
                                                    <p className="placeholder col-4"></p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Empty */}
                            {!loading && !error && paginatedBooks.length === 0 && (
                                <div className="text-center py-5">
                                    <div style={{ fontSize: "60px" }}>📭</div>
                                    <h5 className="mt-3 fw-bold">No books found</h5>
                                    <p className="text-muted">Try adjusting your filters or search term</p>
                                    <button className="btn btn-primary" onClick={handleReset}>
                                        Reset Filters
                                    </button>
                                </div>
                            )}

                            {/* Book Grid / List */}
                            {!loading && paginatedBooks.length > 0 && (
                                <>
                                    <div
                                        className={`row g-3 ${viewMode === "list"
                                                ? "row-cols-1"
                                                : "row-cols-1 row-cols-sm-2 row-cols-xl-3"
                                            }`}
                                    >
                                        {paginatedBooks.map((book) => (
                                            <div key={book.bookId} className="col">
                                                <BookCard
                                                    book={book}
                                                    onAddToCart={handleAddToCart}
                                                    onAddToWishlist={handleAddToWishlist}
                                                    addingToCart={addingToCart === book.bookId}
                                                    cartQuantity={cartQuantities[book.bookId] ?? 0}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <nav className="mt-4 d-flex justify-content-center">
                                            <ul className="pagination">
                                                <li className={`page-item ${currentPage <= 1 ? "disabled" : ""}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                    >
                                                        <i className="bi bi-chevron-left"></i>
                                                    </button>
                                                </li>

                                                {getPaginationPages().map((p, i) =>
                                                    p === "..." ? (
                                                        <li key={`e-${i}`} className="page-item disabled">
                                                            <span className="page-link">…</span>
                                                        </li>
                                                    ) : (
                                                        <li
                                                            key={p}
                                                            className={`page-item ${currentPage === p ? "active" : ""}`}
                                                        >
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handlePageChange(p as number)}
                                                            >
                                                                {p}
                                                            </button>
                                                        </li>
                                                    )
                                                )}

                                                <li className={`page-item ${currentPage >= totalPages ? "disabled" : ""}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                    >
                                                        <i className="bi bi-chevron-right"></i>
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    )}

                                    <p className="text-center text-muted small mt-2">
                                        Page {currentPage} of {totalPages} — {totalCount} total books
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="bg-dark text-white-50 text-center py-3 mt-4">
                    <small>
                        &copy; {new Date().getFullYear()} Book Emporium. All rights reserved.
                    </small>
                </footer>
            </div>
        </>
    );
}