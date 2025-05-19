// src/components/Admin/OrderSummaryCard.tsx
import React from 'react';
import { RestaurantOrder } from '../../types/restaurant.types'; // Adjust path
import Moment from 'react-moment';
import './OrderSumaryCard.scss'; // We'll create this SCSS file
import { FaMale, FaMotorcycle, FaShoppingBag, FaConciergeBell } from 'react-icons/fa'; // Example icons

interface OrderSummaryCardProps {
  order: RestaurantOrder;
  restaurantId: string;
  // onUpdateStatus?: (orderId: string, newStatus: RestaurantOrder['status']) => void; // For future status updates
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ order, restaurantId }) => {
  const getOrderTypeIcon = () => {
    switch (order.type) {
      case 'dine-in':
        return <FaConciergeBell title="Dine-in" />;
      case 'takeaway':
        return <FaShoppingBag title="Takeaway" />;
      case 'delivery':
        return <FaMotorcycle title="Delivery" />;
      default:
        return null;
    }
  };

  const productSummary = Object.values(order.products || {})
    .map(p => `${p.name} x ${p.quantity}`)
    .slice(0, 2) // Show first 2 items
    .join(', ');
  
  const totalItems = Object.values(order.products || {}).reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className={`order-summary-card status-${order.status}`}>
      <div className="card-header">
        <span className="order-id">#{order.id.substring(0, 8)}...</span>
        <div className="order-meta">
            {getOrderTypeIcon()}
            <span className="order-table">{order.tableName || order.table || order.type}</span>
        </div>
        <span className={`order-status-badge status-${order.status}`}>{order.status}</span>
      </div>
      <div className="card-body">
        <p className="product-preview">
            {productSummary}
            {totalItems > 2 && <span>, +{totalItems - 2} more</span>}
        </p>
        <p className="order-time">
            <Moment fromNow>{order.orderTimestamp}</Moment> 
            ( <Moment format="hh:mm A">{order.orderTimestamp}</Moment> )
        </p>
      </div>
      <div className="card-footer">
        <span className="total-amount">₹{order.totalPrice.toFixed(2)}</span>
        {/* Add action buttons here, e.g., view details, update status */}
        {/* <button className="action-btn view-details">View</button> */}
      </div>
    </div>
  );
};

export default OrderSummaryCard;
