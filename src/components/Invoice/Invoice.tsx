// src/components/Invoice/InvoiceGeneratorButton.tsx
import React from 'react';
import jsPDF from 'jspdf';
// Import applyPlugin from jspdf-autotable
import autoTable, { UserOptions } from 'jspdf-autotable'; // Import autoTable and UserOptions
import { Order, OrderProduct, UserProfile } from '../../types/user.types'; // Adjust path
import { Restaurant } from '../../types/restaurant.types'; // Adjust path
import LaCarteLogo from '../../assets/icons/logo.png'; // Adjust path to your logo
import './Invoice.scss';
import addRobotoFont from '../../utils/fonts/Roboto';

// No longer need to extend jsPDF with interface, autoTable function is used directly
// interface jsPDFWithAutoTable extends jsPDF {
//   autoTable: (options: any) => jsPDF;
// }

interface InvoiceGeneratorButtonProps {
  order: Order;
  restaurant: Restaurant | null; 
  user: UserProfile | null;
}

const InvoiceGeneratorButton: React.FC<InvoiceGeneratorButtonProps> = ({ order, restaurant, user }) => {
  const generateInvoice = async () => {
    const doc = new jsPDF();

    // --- Document Properties ---
    addRobotoFont(doc);

    doc.setProperties({
      title: `Invoice - Order #${order.key ? order.key.substring(0, 8) : 'N/A'}`,
      subject: 'Order Invoice from La Carte',
      author: 'La Carte',
    });

    // --- Logo ---
    try {
        const img = new Image();
        img.src = LaCarteLogo; 
        
        // Using a promise to handle image loading ensures it's drawn after loading
        const addImageToPdf = (loadedImg: HTMLImageElement) => {
            const aspectRatio = loadedImg.width / loadedImg.height;
            const imgWidth = 30;
            const imgHeight = imgWidth / aspectRatio;
            doc.addImage(loadedImg, 'PNG', 15, 10, imgWidth, imgHeight);
        };

        if (img.complete && img.naturalHeight !== 0) { // Check if already loaded and valid
            addImageToPdf(img);
        } else if (img.width > 0 && img.height > 0) { // Some browsers might have dimensions before complete
             addImageToPdf(img);
        }
        else {
            // Wait for the image to load
            await new Promise<void>((resolve, reject) => {
                img.onload = () => {
                    addImageToPdf(img);
                    resolve();
                };
                img.onerror = (e) => {
                    console.error("Error loading logo for PDF:", e);
                    doc.text("La Carte", 15, 20); // Fallback text logo
                    reject(e);
                };
            });
        }
    } catch (e) {
        console.error("Error processing logo for PDF:", e);
        doc.text("La Carte", 15, 20); // Fallback text logo
    }


    // --- Invoice Header ---
    doc.setFontSize(22);
    doc.setFont('Roboto', 'bold');
    doc.text('INVOICE', 105, 25, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('Roboto', 'normal');
    doc.text(`Invoice #: INV-${order.key ? order.key.substring(0, 8) : 'N/A'}`, 195, 40, { align: 'right' });
    doc.text(`Order Date: ${new Date(order.time).toLocaleDateString()}`, 195, 45, { align: 'right' });

    // --- Restaurant & User Details ---
    let yPos = 55;
    doc.setFontSize(12);
    doc.setFont('Roboto', 'bold');
    doc.text('Billed To:', 15, yPos);
    doc.text('From:', 105, yPos);

    doc.setFontSize(10);
    doc.setFont('Roboto', 'normal');
    yPos += 6;
    doc.text(user?.displayName || user?.phone || 'Valued Customer', 15, yPos);
    doc.text(restaurant?.name || 'La Carte Restaurant', 105, yPos);
    yPos += 5;
    if (user?.email) doc.text(user.email, 15, yPos);
    if (restaurant?.address) doc.text(restaurant.address.split(',')[0], 105, yPos); 
    yPos += 5;
    if (user?.phone) doc.text(`Phone: ${user.phone}`, 15, yPos);
    if (restaurant?.phone) doc.text(`Phone: ${restaurant.phone || ''}`, 105, yPos);
    else if (restaurant?.address) doc.text(restaurant.address.split(',').slice(1).join(', ').trim(), 105, yPos);


    // --- Order Items Table ---
    yPos += 15;
    const tableColumn = ["#", "Item Name", "Qty", "Unit Price", "Total Price"];
    const tableRows: any[] = [];

    Object.values(order.products).forEach((product: OrderProduct, index) => {
      const productData = [
        index + 1,
        product.name,
        product.quantity,
        `₹${product.price.toFixed(2)}`,
        `₹${(product.price * product.quantity).toFixed(2)}`,
      ];
      tableRows.push(productData);
    });

    // Use the imported autoTable function directly on the doc instance
    autoTable(doc, { // Pass doc as the first argument
      head: [tableColumn],
      body: tableRows,
      startY: yPos,
      theme: 'grid', 
      headStyles: { fillColor: [224, 143, 0] }, // Theme color: #e08f00
      styles: { font: 'Roboto', fontSize: 10 },
      // margin: { top: yPos + 10 } // startY handles this, margin is for page margins
    });

    // --- Totals Section ---
    let finalY = (doc as any).lastAutoTable.finalY || yPos + 20; 
    finalY += 10;

    const subtotal = Object.values(order.products).reduce((acc, p) => acc + (p.price * p.quantity), 0);
    const taxes = order.totalPrice - subtotal; 

    doc.setFontSize(10);
    doc.text(`Subtotal:`, 140, finalY, { align: 'left' });
    doc.text(`₹${subtotal.toFixed(2)}`, 195, finalY, { align: 'right' });
    finalY += 7;

    if (taxes > 0.005) { // Check for taxes greater than a very small amount to avoid showing ₹0.00
        doc.text(`Taxes (GST):`, 140, finalY, { align: 'left' });
        doc.text(`₹${taxes.toFixed(2)}`, 195, finalY, { align: 'right' });
        finalY += 7;
    }

    doc.setFontSize(12);
    // doc.setFont('Roboto', 'bold');
    doc.text(`Grand Total:`, 140, finalY, { align: 'left' });
    doc.text(`₹${order.totalPrice.toFixed(2)}`, 195, finalY, { align: 'right' });

    // --- Footer Notes ---
    finalY += 15;
    doc.setFontSize(9);
    doc.setFont('Roboto', 'italic');
    doc.text('Thank you for your order with La Carte!', 105, finalY, { align: 'center' });
    finalY += 5;
    doc.text(`Payment ID: ${order.paymentId || 'N/A'} | Status: ${order.paymentStatus || order.status || 'N/A'}`, 105, finalY, { align: 'center' });


    // --- Save PDF ---
    doc.save(`Invoice-LaCarte-${order.key ? order.key.substring(0, 8) : Date.now()}.pdf`);
  };

  return (
    <button onClick={generateInvoice} className="invoice-download-button" aria-label="Download Invoice">
      Download Invoice
    </button>
  );
};

export default InvoiceGeneratorButton;
