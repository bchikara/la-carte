// src/components/Admin/Orders/AdminOrderCard.tsx
import React, { useState } from 'react';
import Moment from 'react-moment';
import { RestaurantOrder, OrderStatus, PaymentStatus } from '../../types/restaurant.types'; // Adjust path
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import { useUserStore } from '../../store/userStore'; // For current user if needed for invoice
import InvoiceGeneratorButton from '../Invoice/Invoice'; // Adjust path
import VegIcon from '../../assets/icons/veg.svg'; // Adjust path
import NonVegIcon from '../../assets/icons/non-veg.svg'; // Adjust path
import { FaEdit, FaPrint, FaMoneyBillWave, FaConciergeBell, FaShoppingBag, FaMotorcycle, FaSpinner } from 'react-icons/fa';
import './AdminOrderCard.scss';
import { Order, OrderProduct } from '../../types/user.types';
import jsPDF from 'jspdf';

interface AdminOrderCardProps {
  order: RestaurantOrder;
  restaurantId: string;
}

const AdminOrderCard: React.FC<AdminOrderCardProps> = ({ order, restaurantId }) => {
  const { 
    updateRestaurantOrderStatus, 
    updateRestaurantOrderPaymentStatus,
    currentRestaurant // For restaurant details in invoice
  } = useRestaurantStore();
  const { currentUser } = useUserStore(); // For user details in invoice if needed

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  const orderStatusOptions: OrderStatus[] = [
    'pending', 'confirmed', 'preparing', 'ready_for_pickup', 
    'out_for_delivery', 'served', 'completed', 'paid', 'cancelled_restaurant', 'cancelled_user'
  ];
  const paymentStatusOptions: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded', 'not_applicable'];

  const handleOrderStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    setIsUpdatingStatus(true);
    try {
      await updateRestaurantOrderStatus(restaurantId, order.id, newStatus);
      // Snackbar success can be triggered from store or here
    } catch (error) {
      console.error("Failed to update order status:", error);
      // Snackbar error
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePaymentStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPaymentStatus = e.target.value as PaymentStatus;
    setIsUpdatingPayment(true);
    try {
      await updateRestaurantOrderPaymentStatus(restaurantId, order.id, newPaymentStatus);
      // Snackbar success
    } catch (error) {
      console.error("Failed to update payment status:", error);
      // Snackbar error
    } finally {
      setIsUpdatingPayment(false);
    }
  };
  
  const getOrderTypeIcon = () => {
    switch (order.type) {
      case 'dine-in': return <FaConciergeBell title={`Dine-in: ${order.tableName || order.tableId || ''}`} />;
      case 'takeaway': return <FaShoppingBag title="Takeaway" />;
      case 'delivery': return <FaMotorcycle title="Delivery" />;
      default: return null;
    }
  };

  const handlePrintPOS = () => {
    // This is a placeholder for actual POS printing logic.
    // It would typically involve formatting data specifically for a thermal printer
    // and using browser print API or a dedicated POS integration.
    // For now, we can re-use the invoice generation and trigger a print dialog.
    
    // Create an iframe to load the PDF and trigger print
    const pdfWindow = window.open("", "_blank");
    if (pdfWindow) {
        pdfWindow.document.write("<html><head><title>Printing KOT/Invoice...</title></head><body></body></html>");
        pdfWindow.document.close();
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: [80, 297] }); // POS receipt size (80mm width)
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(currentRestaurant?.name || 'Restaurant', 5, 10);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Order: #${order.id.substring(0,6)}`, 5, 15);
        doc.text(`Table: ${order.tableName || order.tableId || order.type}`, 5, 20);
        doc.text(`Date: ${new Date(order.orderTimestamp).toLocaleString()}`, 5, 25);
        doc.text('---------------------------------', 5, 30);

        let yPos = 35;
        Object.values(order.products).forEach((item: OrderProduct) => {
            doc.text(`${item.quantity} x ${item.name}`, 5, yPos);
            doc.text(`Rs${(item.price * item.quantity).toFixed(2)}`, 75, yPos, { align: 'right' });
            yPos += 5;
        });
        doc.text('---------------------------------', 5, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Total:', 5, yPos);
        doc.text(`Rs${order.totalPrice.toFixed(2)}`, 75, yPos, { align: 'right' });
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('Thank You! Visit Again!', 40, yPos, {align: 'center'});

        pdfWindow.document.body.innerHTML = `<embed width="100%" height="100%" src="${doc.output('datauristring')}" type="application/pdf">`;
        setTimeout(() => { // Allow PDF to load in iframe
            pdfWindow.print();
            // pdfWindow.close(); // Optional: close after print dialog
        }, 1000);
    } else {
        alert("Could not open print window. Please check your pop-up blocker settings.");
    }
  };

 console.log(order, 'order details')
  return (
    <div className={`admin-order-card status-bg-${order.status} payment-bg-${order.paymentStatus}`}>
      <div className="order-card-main-info">
        <div className="order-id-type">
            <span className="order-id">ID: #{order.id.substring(0, 8)}...</span>
            <span className="order-type-icon">{getOrderTypeIcon()} {order.tableName || order.tableId || order.type}</span>
        </div>
        <div className="order-customer">
            {order.customerName && <p><strong>Cust:</strong> {order.customerName}</p>}
            {order.customerPhone && <p><strong>Ph:</strong> {order.customerPhone}</p>}
        </div>
        <div className="order-time-details">
            <Moment format="DD MMM, hh:mm A">{order.orderTimestamp}</Moment>
        </div>
      </div>

      <div className="order-items-preview">
        {Object.values(order.products).map((product, index) => (
          <div className="item-preview" key={index}>
            <img 
                src={product.veg === true || product.veg === 'true' ? VegIcon : NonVegIcon} 
                alt={product.veg ? "Veg" : "Non-Veg"} 
                className="item-veg-indicator"
            />
            <span>{product.name} x {product.quantity}</span>
            <span>₹{(product.price * product.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="order-totals-row">
        <strong>Total: ₹{order.totalPrice.toFixed(2)}</strong>
      </div>

      <div className="order-status-controls">
        <div className="status-control-group">
          <label htmlFor={`order-status-${order.id}`}>Order Status:</label>
          <select
            id={`order-status-${order.id}`}
            value={order.status}
            onChange={handleOrderStatusChange}
            disabled={isUpdatingStatus}
            className={`status-select status-select-${order.status}`}
          >
            {orderStatusOptions.map(statusOpt => (
              <option key={statusOpt} value={statusOpt}>{statusOpt.replace(/_/g, ' ').toUpperCase()}</option>
            ))}
          </select>
          {isUpdatingStatus && <FaSpinner className="status-spinner" />}
        </div>
        <div className="status-control-group">
          <label htmlFor={`payment-status-${order.id}`}>Payment:</label>
          <select
            id={`payment-status-${order.id}`}
            value={order.paymentStatus || 'pending'}
            onChange={handlePaymentStatusChange}
            disabled={isUpdatingPayment}
            className={`status-select payment-select-${order.paymentStatus}`}
          >
            {paymentStatusOptions.map(statusOpt => (
              <option key={statusOpt} value={statusOpt}>{statusOpt.replace(/_/g, ' ').toUpperCase()}</option>
            ))}
          </select>
          {isUpdatingPayment && <FaSpinner className="status-spinner" />}
        </div>
      </div>
      
      <div className="order-card-actions">
        <InvoiceGeneratorButton 
            order={order as unknown as Order} 
            restaurant={currentRestaurant} 
            user={currentUser}
         />
        <button onClick={handlePrintPOS} className="action-button print-pos-button">
            <FaPrint /> KOT/Bill
        </button>
      </div>
    </div>
  );
};

export default AdminOrderCard;
