// src/components/Admin/AdminLayout.tsx
import React from 'react';
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore'; // Adjust path
import './AdminLayout.scss'; // We'll create this SCSS file
import LaCarteLogo from '../../assets/icons/logo.png'; // Adjust path

// React Icons for sidebar
import { FaTachometerAlt, FaUtensils, FaClipboardList, FaChartBar, FaCog, FaSignOutAlt, FaQrcode, FaTable } from 'react-icons/fa';

const AdminLayout: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const { signOutUser, currentUser } = useUserStore();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOutUser();
        navigate('/login'); // Redirect to login after admin signs out
    };

    const baseAdminPath = `/admin/restaurant/${restaurantId}`;

    const sidebarLinks = [
        { path: `${baseAdminPath}/`, label: 'Dashboard', icon: <FaTachometerAlt /> },
        { path: `${baseAdminPath}/orders`, label: 'Orders', icon: <FaClipboardList /> },
        { path: `${baseAdminPath}/menu`, label: 'Menu Editor', icon: <FaUtensils /> },
        { path: `${baseAdminPath}/analytics`, label: 'Analytics', icon: <FaChartBar /> },
        { path: `${baseAdminPath}/settings`, label: 'Settings', icon: <FaCog /> },
        // { path: `${baseAdminPath}/tables`, label: 'Tables & QR', icon: <FaTable /> }, // Integrated into settings for now
    ];

    return (
        <div className="admin-layout-container">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <img src={LaCarteLogo} alt="La Carte Admin" className="sidebar-logo" />
                    <span className="sidebar-title">Admin Panel</span>
                </div>
                <nav className="sidebar-nav">
                    {sidebarLinks.map(link => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleSignOut} className="sidebar-nav-link logout-btn">
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <main className="admin-main-content">
                <Outlet /> {/* This is where the nested admin route components will render */}
            </main>
        </div>
    );
};

export default AdminLayout;
