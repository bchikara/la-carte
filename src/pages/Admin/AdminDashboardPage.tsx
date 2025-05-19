// src/pages/Admin/AdminDashboardPage.tsx
import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import { useUserStore } from '../../store/userStore'; // Adjust path
import { RestaurantOrder } from '../../types/restaurant.types'; // Adjust path
import OrderSummaryCard from '../../components/Admin/OrderSumaryCard'; // Adjust path
import './AdminDashboardPage.scss';
import { FaPlusCircle, FaEdit, FaEye, FaClipboardList, FaUtensils, FaCog } from 'react-icons/fa';

const AdminDashboardPage: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const { 
        currentRestaurant, 
        allRestaurantOrders, 
        isLoadingAllOrders, 
        errorAllOrders,
        listenToRestaurantAndMenu, // This also triggers listenToAllRestaurantOrders
        stopListeningToRestaurantDetails // This also stops order listener
    } = useRestaurantStore();

    const { currentUser } = useUserStore();

    useEffect(() => {
        if (restaurantId) {
            console.log('data',restaurantId,currentRestaurant,isLoadingAllOrders,errorAllOrders)
            listenToRestaurantAndMenu(restaurantId); // Fetches restaurant details and its orders
        }
        return () => {
            if (restaurantId) {
                stopListeningToRestaurantDetails(); // Cleans up restaurant and its order listeners
            }
        };
    }, [restaurantId, listenToRestaurantAndMenu, stopListeningToRestaurantDetails]);

    const newOrders = useMemo(() => {
        console.log('all orders',allRestaurantOrders)
        return allRestaurantOrders
            .filter(order => order.status !== 'served')
            .sort((a, b) => b.orderTimestamp - a.orderTimestamp);
    }, [allRestaurantOrders]);

    const recentlyServedOrders = useMemo(() => {
        return allRestaurantOrders
            .filter(order => order.status === 'served' || order.status === 'completed' || order.status === 'paid')
            .sort((a, b) => b.orderTimestamp - a.orderTimestamp)
            .slice(0, 10); // Top 10
    }, [allRestaurantOrders]);

    if (isLoadingAllOrders && allRestaurantOrders.length === 0 && !currentRestaurant) {
        return <div className="admin-loading-state">Loading Dashboard Data...</div>;
    }
    if (errorAllOrders) {
        return <div className="admin-error-state">Error loading orders: {errorAllOrders}</div>;
    }
    if (!currentRestaurant) {
        return <div className="admin-error-state">Restaurant data not found. Ensure you are on the correct admin path.</div>;
    }


    return (
        <div className="admin-dashboard-page">
            <header className="dashboard-header">
                <h1>{currentRestaurant?.name || 'Restaurant'} Dashboard</h1>
                <p>Welcome, {currentUser?.displayName || 'Admin'}!</p>
            </header>

            <section className="dashboard-quick-actions">
                <Link to={`/admin/restaurant/${restaurantId}/orders`} className="action-card">
                    <FaClipboardList />
                    <span>View All Orders</span>
                </Link>
                <Link to={`/admin/restaurant/${restaurantId}/menu`} className="action-card">
                    <FaUtensils />
                    <span>Edit Menu</span>
                </Link>
                 <Link to={`/admin/restaurant/${restaurantId}/settings`} className="action-card">
                    <FaCog />
                    <span>Restaurant Settings</span>
                </Link>
            </section>

            <div className="dashboard-orders-grid">
                <section className="orders-column new-orders-column">
                    <h2><FaPlusCircle /> New Orders ({newOrders.length})</h2>
                    {isLoadingAllOrders && newOrders.length === 0 && <p>Loading new orders...</p>}
                    {!isLoadingAllOrders && newOrders.length === 0 && <p className="no-orders-message">No new orders at the moment.</p>}
                    <div className="orders-scroll-container">
                        {newOrders.map(order => (
                            <OrderSummaryCard key={order.id} order={order} restaurantId={restaurantId!} />
                        ))}
                    </div>
                </section>

                <section className="orders-column recent-orders-column">
                    <h2><FaEye /> Recently Served/Completed (Top 10)</h2>
                     {isLoadingAllOrders && recentlyServedOrders.length === 0 && <p>Loading recent orders...</p>}
                    {!isLoadingAllOrders && recentlyServedOrders.length === 0 && <p className="no-orders-message">No recently served orders.</p>}
                    <div className="orders-scroll-container">
                        {recentlyServedOrders.map(order => (
                            <OrderSummaryCard key={order.id} order={order} restaurantId={restaurantId!} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
