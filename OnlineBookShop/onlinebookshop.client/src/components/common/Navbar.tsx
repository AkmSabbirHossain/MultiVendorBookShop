// =============================================
// Navbar.tsx —
// =============================================

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthService from "../../services/auth.service";
import CartService from "../../services/cart.service";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLLIElement>(null);

  const [user, setUser] = useState(AuthService.getCurrentUser());
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  
  useEffect(() => {
    const loadCartCount = async () => {
      if (!AuthService.isAuthenticated()) {
        setCartCount(0); 
        return;
      }
      try {
        const cart = await CartService.getMyCart();
        setCartCount(cart.items.length);
      } catch {
        setCartCount(0);
      }
    };
    loadCartCount(); 
  }, [location.pathname]);

  // ── Cart update event ──
  useEffect(() => {
    const handleCartUpdate = async () => {
      if (!AuthService.isAuthenticated()) return;
      try {
        const cart = await CartService.getMyCart();
        setCartCount(cart.items.length);
      } catch {
        setCartCount(0);
      }
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  // ── User updateFOR Login/Logout   ──
  useEffect(() => {
    const handleAuthChange = () => {
      setUser(AuthService.getCurrentUser());
      setCartCount(0);
    };
    window.addEventListener("authChanged", handleAuthChange);
    return () => window.removeEventListener("authChanged", handleAuthChange);
  }, []);

  // ──   Click outside for Dropdown Close ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false); 
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ──Dropdown close for  Page change  ──
 
  const currentPath = location.pathname;

  const handleLogout = () => {
    setDropdownOpen(false);
    AuthService.logout();
    navigate("/auth");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
      <div className="container">

        {/* Brand */}
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <span style={{ fontSize: "22px" }}>📚</span>
          <span>Book Emporium</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">

          {/* Search */}
          <form
            className="d-flex mx-auto my-2 my-lg-0"
            style={{ width: "100%", maxWidth: "420px" }}
            onSubmit={handleSearch}
          >
            <div className="input-group">
              <input
                type="search"
                className="form-control"
                placeholder="Search books, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-warning" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          {/* Right Side */}
          <ul className="navbar-nav ms-auto align-items-center gap-1">

            {/* Cart */}
            <li className="nav-item">
              <Link
                className="nav-link position-relative"
                to={AuthService.isAuthenticated() ? "/cart" : "/auth"}
              >
                <i className="bi bi-cart3 fs-5"></i>
                {cartCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
                    style={{ fontSize: "10px" }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </li>

            {/* Wishlist */}
            <li className="nav-item">
              <Link className="nav-link" to="/wishlist">
                <i className="bi bi-heart fs-5"></i>
              </Link>
            </li>

            {/* User Menu */}
            {user ? (
              <li className="nav-item position-relative" ref={dropdownRef}>

                {/* Toggle Button */}
                <button
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  <i className="bi bi-person-circle"></i>
                  <span>{user.name}</span>
                  <i
                    className={`bi bi-chevron-${dropdownOpen ? "up" : "down"} ms-1`}
                    style={{ fontSize: "11px" }}
                  ></i>
                </button>

                {/* Dropdown —  */}
                {dropdownOpen && currentPath === location.pathname && (
                  <ul
                    className="dropdown-menu dropdown-menu-end shadow show"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      minWidth: "210px",
                      zIndex: 9999,
                    }}
                  >
                    {/* Role badge */}
                    <li>
                      <span className="dropdown-item-text d-flex align-items-center gap-2">
                        <span
                          className={`badge ${
                            user.role === "Admin"
                              ? "bg-danger"
                              : user.role === "Vendor"
                              ? "bg-warning text-dark"
                              : "bg-primary"
                          }`}
                        >
                          {user.role}
                        </span>
                        <small className="text-muted text-truncate">{user.email}</small>
                      </span>
                    </li>
                    <li><hr className="dropdown-divider my-1" /></li>

                    {/* Profile */}
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="bi bi-person me-2"></i>My Profile
                      </Link>
                    </li>

                    {/* Orders — Customer only */}
                    {user.role === "Customer" && (
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/orders"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-bag me-2"></i>My Orders
                        </Link>
                      </li>
                    )}

                    {/* Become Vendor — Customer only */}
                    {user.role === "Customer" && (
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/vendor/register"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-shop me-2"></i>Become a Vendor
                        </Link>
                      </li>
                    )}

                    {/* Vendor Dashboard */}
                    {user.role === "Vendor" && (
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/vendor/dashboard"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-shop me-2"></i>Vendor Dashboard
                        </Link>
                      </li>
                    )}

                    {/* Admin Panel */}
                    {user.role === "Admin" && (
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-gear me-2"></i>Admin Panel
                        </Link>
                      </li>
                    )}

                    <li><hr className="dropdown-divider my-1" /></li>

                    {/* Logout */}
                    <li>
                      <button
                        className="dropdown-item text-danger d-flex align-items-center gap-2"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right"></i>
                        Logout
                      </button>
                    </li>

                  </ul>
                )}
              </li>
            ) : (
              <li className="nav-item">
                <Link className="btn btn-warning btn-sm fw-semibold" to="/auth">
                  <i className="bi bi-person me-1"></i>Sign In
                </Link>
              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}