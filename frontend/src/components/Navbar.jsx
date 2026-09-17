import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function Navbar() {
    const navigate = useNavigate();
    const { user, isAdmin, logout } = useAuth();
    const { itemCount } = useCart();
    const { count: wishlistCount } = useWishlist();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        logout();
        closeMenu();
        navigate("/login");
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        closeMenu();
        const query = searchTerm.trim();
        navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    };

    return (
        <header className="navbar">
            <div className="navbar__bar">
                <Link to="/" className="navbar__brand" onClick={closeMenu}>
                    Shop<span>Sphere</span>
                </Link>

                <form className="navbar__search" onSubmit={handleSearchSubmit} role="search">
                    <input
                        type="search"
                        className="input"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search products"
                    />
                    <button type="submit" className="btn btn--primary btn--sm" aria-label="Search">
                        Search
                    </button>
                </form>

                <button
                    className="navbar__toggle"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-expanded={menuOpen}
                    aria-controls="navbar-menu"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>

            <nav
                id="navbar-menu"
                className={`navbar__menu${menuOpen ? " navbar__menu--open" : ""}`}
                aria-label="Main navigation"
            >
                <Link to="/" onClick={closeMenu}>Home</Link>
                <Link to="/products" onClick={closeMenu}>Products</Link>

                {user && <Link to="/orders" onClick={closeMenu}>My Orders</Link>}
                {user && (
                    <Link to="/wishlist" className="navbar__cart" onClick={closeMenu}>
                        Wishlist
                        <span className="navbar__cart-count" aria-hidden="true">{wishlistCount}</span>
                        <span className="visually-hidden">, {wishlistCount} items</span>
                    </Link>
                )}

                {isAdmin && (
                    <>
                        <Link to="/admin/dashboard" onClick={closeMenu}>Admin Dashboard</Link>
                        <Link to="/admin/products" onClick={closeMenu}>Admin Products</Link>
                        <Link to="/admin/orders" onClick={closeMenu}>Admin Orders</Link>
                    </>
                )}

                <Link to="/cart" className="navbar__cart" onClick={closeMenu}>
                    Cart
                    <span className="navbar__cart-count" aria-hidden="true">{itemCount}</span>
                    <span className="visually-hidden">, {itemCount} items</span>
                </Link>

                {user ? (
                    <div className="navbar__user">
                        <Link to="/account" className="text-sm text-muted" onClick={closeMenu}>
                            Hi, {user.name.split(" ")[0]}
                        </Link>
                        <button className="btn btn--outline btn--sm" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="row" style={{ gap: 8 }}>
                        <Link to="/login" className="btn btn--outline btn--sm" onClick={closeMenu}>
                            Login
                        </Link>
                        <Link to="/register" className="btn btn--primary btn--sm" onClick={closeMenu}>
                            Register
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Navbar;
