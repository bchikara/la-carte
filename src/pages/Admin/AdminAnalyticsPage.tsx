// src/pages/Admin/AdminAnalyticsPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import { RestaurantOrder } from '../../types/restaurant.types'; // Adjust path
import './AdminAnalyticsPage.scss'; // We'll create this SCSS file

import { FaCalendarAlt, FaSpinner, FaDownload, FaChartLine, FaFileCsv, FaDollarSign, FaShoppingCart } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CSVLink } from 'react-csv';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import Moment from 'react-moment'; // For formatting dates in tooltips/axes
import moment from 'moment';

const AdminAnalyticsPage: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const {
        currentRestaurant,
        allRestaurantOrders,
        isLoadingAllOrders,
        errorAllOrders,
        listenToRestaurantAndMenu,
        stopListeningToRestaurantDetails,
    } = useRestaurantStore();

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [startDate, setStartDate] = useState<Date | null>(firstDayOfMonth);
    const [endDate, setEndDate] = useState<Date | null>(today);

    useEffect(() => {
        if (restaurantId) {
            listenToRestaurantAndMenu(restaurantId); // Fetches restaurant details and its orders
        }
        return () => {
            if (restaurantId) {
                stopListeningToRestaurantDetails(); // Cleans up restaurant and its order listeners
            }
        };
    }, [restaurantId, listenToRestaurantAndMenu, stopListeningToRestaurantDetails]);

    const ordersInDateRange = useMemo(() => {
        if (!allRestaurantOrders) return [];
        let orders = allRestaurantOrders;
        if (startDate) {
            const rangeStart = new Date(startDate.setHours(0, 0, 0, 0));
            orders = orders.filter(order => new Date(order.orderTimestamp) >= rangeStart);
        }
        if (endDate) {
            const rangeEnd = new Date(endDate.setHours(23, 59, 59, 999));
            orders = orders.filter(order => new Date(order.orderTimestamp) <= rangeEnd);
        }
        // Consider only 'completed' or 'paid' orders for sales analytics
        return orders.filter(order => order.status === 'completed' || order.status === 'paid' || order.status === 'served');
    }, [allRestaurantOrders, startDate, endDate]);

    const analyticsSummary = useMemo(() => {
        const totalSales = ordersInDateRange.reduce((sum, order) => sum + order.totalPrice, 0);
        const totalOrders = ordersInDateRange.length;
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        return {
            totalSales,
            totalOrders,
            averageOrderValue,
        };
    }, [ordersInDateRange]);

    const salesChartData = useMemo(() => {
        if (!ordersInDateRange.length) return [];
        const salesByDay: { [key: string]: number } = {};
        ordersInDateRange.forEach(order => {
            const date = new Date(order.orderTimestamp).toLocaleDateString('en-CA'); // YYYY-MM-DD for easy sorting
            salesByDay[date] = (salesByDay[date] || 0) + order.totalPrice;
        });
        return Object.keys(salesByDay)
            .map(date => ({ date, sales: salesByDay[date] }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [ordersInDateRange]);

    const ordersChartData = useMemo(() => {
         if (!ordersInDateRange.length) return [];
        const ordersByDay: { [key: string]: number } = {};
        ordersInDateRange.forEach(order => {
            const date = new Date(order.orderTimestamp).toLocaleDateString('en-CA');
            ordersByDay[date] = (ordersByDay[date] || 0) + 1;
        });
        return Object.keys(ordersByDay)
            .map(date => ({ date, count: ordersByDay[date] }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [ordersInDateRange]);


    const handleDateChange = (dates: [Date | null, Date | null] | Date | null) => {
        if (Array.isArray(dates)) {
            const [start, end] = dates;
            setStartDate(start);
            setEndDate(end);
        } else { // For single date selection (if DatePicker is not range)
            setStartDate(dates);
            setEndDate(dates); 
        }
    };
    
    const getCSVData = () => {
        if (!ordersInDateRange.length) return { headers: [], data: [] };
        const headers = [
            { label: "Order ID", key: "id" }, { label: "Date", key: "date" },
            { label: "Time", key: "time" }, { label: "Type", key: "type" },
            { label: "Table/Details", key: "table" }, { label: "Total Price (₹)", key: "totalPrice" },
            { label: "Order Status", key: "status" }, { label: "Payment Status", key: "paymentStatus" },
        ];
        const data = ordersInDateRange.map(order => {
            const orderDateTime = new Date(order.orderTimestamp);
            return {
                id: order.id?.substring(0,8) || order.key?.substring(0,8) || 'N/A',
                date: orderDateTime.toLocaleDateString(),
                time: orderDateTime.toLocaleTimeString(),
                type: order.type,
                table: order.tableName || order.tableId || (order.type !== 'dine-in' ? order.type : 'N/A'),
                totalPrice: order.totalPrice.toFixed(2),
                status: order.status,
                paymentStatus: order.paymentStatus || 'N/A',
            };
        });
        return { headers, data };
    };
    const { headers: csvHeaders, data: csvData } = getCSVData();

    if (isLoadingAllOrders && !currentRestaurant) {
        return <div className="admin-loading-state"><FaSpinner className="spinner-icon"/>Loading Analytics Data...</div>;
    }
    if (errorAllOrders) {
        return <div className="admin-error-state">Error loading order data: {errorAllOrders}</div>;
    }
    if (!currentRestaurant && !isLoadingAllOrders) {
        return <div className="admin-error-state">Restaurant data not available.</div>;
    }

    return (
        <div className="admin-analytics-page">
            <header className="analytics-page-header">
                <h1>Sales & Order Analytics: {currentRestaurant?.name}</h1>
                <div className="filters-container">
                    <div className="date-range-filter">
                        <FaCalendarAlt className="filter-icon" />
                        <DatePicker
                            selected={startDate}
                            onChange={handleDateChange}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            isClearable={true}
                            placeholderText="Select date range"
                            dateFormat="dd/MM/yyyy"
                            className="date-picker-input"
                            wrapperClassName="date-picker-wrapper"
                        />
                    </div>
                    {ordersInDateRange.length > 0 && (
                         <CSVLink
                            data={csvData}
                            headers={csvHeaders}
                            filename={`analytics_${restaurantId}_${startDate?.toISOString().split('T')[0]}_to_${endDate?.toISOString().split('T')[0]}.csv`}
                            className="admin-cta-button download-csv-button"
                            target="_blank"
                        >
                            <FaDownload /> Export Data
                        </CSVLink>
                    )}
                </div>
            </header>

            <section className="summary-stats-section">
                <div className="stat-card">
                    <FaDollarSign className="stat-icon sales" />
                    <div className="stat-value">₹{analyticsSummary.totalSales.toFixed(2)}</div>
                    <div className="stat-label">Total Sales</div>
                </div>
                <div className="stat-card">
                    <FaShoppingCart className="stat-icon orders" />
                    <div className="stat-value">{analyticsSummary.totalOrders}</div>
                    <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-card">
                    <FaChartLine className="stat-icon avg-order" />
                    <div className="stat-value">₹{analyticsSummary.averageOrderValue.toFixed(2)}</div>
                    <div className="stat-label">Avg. Order Value</div>
                </div>
            </section>

            <section className="charts-section">
                <div className="chart-container">
                    <h3>Sales Over Time</h3>
                    {salesChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={(tick) => moment(tick).format('MMM DD')} />
                                <YAxis tickFormatter={(tick) => `₹${tick}`} />
                                <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, "Sales"]}/>
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#e08f00" strokeWidth={2} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <p className="no-chart-data">No sales data for the selected period.</p>}
                </div>

                <div className="chart-container">
                    <h3>Orders Per Day</h3>
                     {ordersChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ordersChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={(tick) => moment(tick).format('MMM DD')} />
                                <YAxis allowDecimals={false} />
                                <Tooltip formatter={(value: number) => [value, "Orders"]}/>
                                <Legend />
                                <Bar dataKey="count" fill="#ffbc36" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="no-chart-data">No order count data for the selected period.</p>}
                </div>
            </section>
        </div>
    );
};

export default AdminAnalyticsPage;
