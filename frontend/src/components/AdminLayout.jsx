import { NavLink, Outlet } from "react-router-dom";

const links = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/orders", label: "Orders" },
];

function AdminLayout() {
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <h4 style={{ padding: "0 14px" }}>Admin</h4>
                <nav>
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) => (isActive ? "active" : undefined)}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
}

export default AdminLayout;
