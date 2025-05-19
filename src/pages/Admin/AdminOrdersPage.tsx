// src/pages/Admin/AdminOrdersPage.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import { RestaurantOrder } from '../../types/restaurant.types'; // Adjust path
import AdminOrderCard from '../../components/Admin/AdminOrderCard'; // Adjust path
import './AdminOrdersPage.scss'; // We'll create this
import { FaSearch, FaCalendarAlt, FaSpinner, FaDownload } from 'react-icons/fa';
import { CSVLink } from 'react-csv'; // For CSV download
import DatePicker from 'react-datepicker'; // For date filtering
import 'react-datepicker/dist/react-datepicker.css';

interface CSVHeader {
    label: string;
    key: string;
}

interface CSVData {
    id: string;
    date: string;
    time: string;
    customerName: string;
    customerPhone: string;
    type: string;
    table: string;
    totalPrice: string;
    status: string;
    paymentStatus: string;
    itemsSummary: string;
}

// Debounce hook (can be moved to a shared utils/hooks folder)
const useDebounce = (value: string, delay: number): string => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const AdminOrdersPage: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const {
        currentRestaurant, // Needed for restaurant name, etc.
        allRestaurantOrders,
        isLoadingAllOrders,
        errorAllOrders,
        listenToRestaurantAndMenu, // This also triggers listening to allRestaurantOrders
        stopListeningToRestaurantDetails, // This also stops order listener
    } = useRestaurantStore();

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Date filtering state
    const today = new Date();
    const [startDate, setStartDate] = useState<Date | null>(today);
    const [endDate, setEndDate] = useState<Date | null>(today);

    useEffect(() => {
        if (restaurantId) {
            // listenToRestaurantAndMenu fetches restaurant details and then triggers
            // listenToAllRestaurantOrders for that restaurant.
            listenToRestaurantAndMenu(restaurantId);
        }
        return () => {
            if (restaurantId) {
                stopListeningToRestaurantDetails(); // This also stops the order listener for the current restaurant
            }
        };
    }, [restaurantId, listenToRestaurantAndMenu, stopListeningToRestaurantDetails]);

    const filteredAndSortedOrders = useMemo(() => {
        let orders = allRestaurantOrders;

        // Filter by date range
        if (startDate && endDate) {
            const rangeStart = new Date(startDate.setHours(0, 0, 0, 0));
            const rangeEnd = new Date(endDate.setHours(23, 59, 59, 999));
            orders = orders.filter(order => {
                const orderDate = new Date(order.orderTimestamp);
                return orderDate >= rangeStart && orderDate <= rangeEnd;
            });
        } else if (startDate) { // If only start date, filter from start date onwards
             const rangeStart = new Date(startDate.setHours(0, 0, 0, 0));
             orders = orders.filter(order => new Date(order.orderTimestamp) >= rangeStart);
        }


        // Filter by search term
        if (debouncedSearchTerm) {
            const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
            orders = orders.filter(order =>
                order.id.toLowerCase().includes(lowerSearchTerm) ||
                order.customerName?.toLowerCase().includes(lowerSearchTerm) ||
                order.customerPhone?.includes(lowerSearchTerm) ||
                order.tableName?.toLowerCase().includes(lowerSearchTerm) ||
                order.tableId?.toLowerCase().includes(lowerSearchTerm) ||
                Object.values(order.products).some(p => p.name.toLowerCase().includes(lowerSearchTerm))
            );
        }
        // Sort by timestamp, newest first (already done in store, but can re-sort if needed)
        return orders.sort((a, b) => b.orderTimestamp - a.orderTimestamp);
    }, [allRestaurantOrders, debouncedSearchTerm, startDate, endDate]);

    const handleDateChange = (dates: [Date | null, Date | null] | Date | null) => {
        if (Array.isArray(dates)) {
            const [start, end] = dates;
            setStartDate(start);
            setEndDate(end);
        } else { // Single date selected
            setStartDate(dates);
            setEndDate(dates); // Set end date same as start for single day selection
        }
    };
    
    const getCSVData = (): { headers: CSVHeader[]; data: CSVData[] } => {
        if (!filteredAndSortedOrders.length) return { headers: [], data: [] };
        const headers = [
            { label: "Order ID", key: "id" },
            { label: "Date", key: "date" },
            { label: "Time", key: "time" },
            { label: "Customer Name", key: "customerName" },
            { label: "Customer Phone", key: "customerPhone" },
            { label: "Type", key: "type" },
            { label: "Table", key: "table" },
            { label: "Total Price", key: "totalPrice" },
            { label: "Order Status", key: "status" },
            { label: "Payment Status", key: "paymentStatus" },
            { label: "Items", key: "itemsSummary" },
        ];

        const data = filteredAndSortedOrders.map(order => {
            const orderDateTime = new Date(order.orderTimestamp);
            return {
                id: order.id.substring(0,8),
                date: orderDateTime.toLocaleDateString(),
                time: orderDateTime.toLocaleTimeString(),
                customerName: order.customerName || 'N/A',
                customerPhone: order.customerPhone || 'N/A',
                type: order.type,
                table: order.tableName || order.tableId || 'N/A',
                totalPrice: order.totalPrice.toFixed(2),
                status: order.status,
                paymentStatus: order.paymentStatus || 'N/A',
                itemsSummary: Object.values(order.products).map(p => `${p.name} x${p.quantity}`).join('; ')
            };
        });
        return { headers, data };
    };
    
    const { headers: csvHeaders, data: csvData } = getCSVData();


    if (isLoadingAllOrders && allRestaurantOrders.length === 0 && !currentRestaurant) {
        return <div className="admin-loading-state">Loading Restaurant Orders...</div>;
    }
    if (errorAllOrders) {
        return <div className="admin-error-state">Error loading orders: {errorAllOrders}</div>;
    }
     if (!currentRestaurant && !isLoadingAllOrders) {
        return <div className="admin-error-state">Restaurant data not available. Please select a restaurant.</div>;
    }


    return (
        <div className="admin-orders-page">
            <header className="orders-page-header">
                <h1>Manage Orders for {currentRestaurant?.name || 'Restaurant'}</h1>
                <div className="filters-and-actions">
                    <div className="search-orders-filter">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search Order ID, Customer, Table..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="date-range-filter">
                        <FaCalendarAlt className="date-icon" />
                        <DatePicker
                            selected={startDate}
                            onChange={handleDateChange}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            isClearable={true}
                            placeholderText="Filter by date range"
                            dateFormat="dd/MM/yyyy"
                            className="date-picker-input"
                        />
                    </div>
                    {filteredAndSortedOrders.length > 0 && (
                         <CSVLink
                            data={csvData}
                            headers={csvHeaders}
                            filename={`orders_${restaurantId}_${new Date().toISOString().split('T')[0]}.csv`}
                            className="admin-cta-button download-csv-button"
                            target="_blank"
                        >
                            <FaDownload /> Export CSV
                        </CSVLink>
                    )}
                </div>
            </header>

            <div className="orders-list-section">
                {isLoadingAllOrders && filteredAndSortedOrders.length === 0 && <div className="loading-inline"><FaSpinner className="spinner-icon"/> Loading orders...</div>}
                {!isLoadingAllOrders && filteredAndSortedOrders.length === 0 && (
                    <p className="no-orders-found">
                        {searchTerm || startDate || endDate ? "No orders found matching your current filters." : "No orders yet for this restaurant."}
                    </p>
                )}
                <div className="admin-orders-grid">
                    {filteredAndSortedOrders.map(order => (
                        <AdminOrderCard key={order.id} order={order} restaurantId={restaurantId!} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminOrdersPage;
