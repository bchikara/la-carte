// src/components/Admin/Settings/AdminTableManager.tsx
import React, { useMemo, useState } from 'react';
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import { Restaurant, RestaurantTable } from '../../types/restaurant.types'; // Adjust path
import QRCodeGenerator from './QRCodeGenerator'; // We'll create this next
import './AdminTableManager.scss'; // We'll create this SCSS file
import { FaPlusCircle, FaEdit, FaTrashAlt, FaQrcode } from 'react-icons/fa';

interface AdminTableManagerProps {
  restaurant: Restaurant; // Full restaurant object to access tables
  restaurantId: string;
}

const AdminTableManager: React.FC<AdminTableManagerProps> = ({ restaurant, restaurantId }) => {
  const { 
    openTableModal, 
    deleteRestaurantTable,
    // We might need a state here to show/hide QR code for a specific table
    // Or handle it within QRCodeGenerator if it's a modal
  } = useRestaurantStore();

  const tablesArray = useMemo(() => {
    return restaurant.tables ? Object.values(restaurant.tables) : [];
  }, [restaurant.tables]);

  const handleAddNewTable = () => {
    openTableModal(); // Open modal for a new table (no existing table data)
  };

  const handleEditTable = (table: RestaurantTable) => {
    openTableModal(table); // Open modal with existing table data
  };

  const handleDeleteTable = async (tableId: string, tableName: string) => {
    if (window.confirm(`Are you sure you want to delete table "${tableName}"? This action cannot be undone.`)) {
      try {
        await deleteRestaurantTable(restaurantId, tableId);
        // Optionally show success message via snackbar
      } catch (error) {
        console.error("Error deleting table:", error);
        // Optionally show error message
      }
    }
  };
  
  // State to manage which table's QR code is currently being shown
  const [showingQrForTableId, setShowingQrForTableId] = useState<string | null>(null);

  const handleShowQrCode = (table: RestaurantTable) => {
    console.log(tablesArray,'table ')
    if (!table.id) {
        alert("Table ID is missing. Cannot generate QR code.");
        return;
    }
    // Construct the URL for the QR code
    // Example: https://yourdomain.com/menu/restaurant-firebase-id?tableId=table-firebase-key
    // Or if using user-defined IDs for tables that are URL-friendly:
    // https://yourdomain.com/menu/restaurant-firebase-id?table=user-defined-table-id
    const qrValue = `${window.location.origin}/menu/${restaurantId}?table=${table.id}`;
    
    // If RestaurantTable type doesn't store qrCodeValue, we generate it here.
    // Ideally, on table creation/update, this value is generated and stored with the table.
    // For now, we'll generate on the fly for display.
    const tableWithQrValue = { ...table, qrCodeValue: qrValue };
    
    setShowingQrForTableId(tableWithQrValue.id === showingQrForTableId ? null : tableWithQrValue.id); 
    // If you want to store/update the qrCodeValue in Firebase when first shown:
    // if (!table.qrCodeValue && restaurantId && table.id) {
    //   useRestaurantStore.getState().updateRestaurantTable(restaurantId, table.id, { qrCodeValue: qrValue });
    // }
  };


  return (
    <div className="admin-table-manager">
      <div className="table-manager-header">
        <h4>Manage Your Tables</h4>
        <button onClick={handleAddNewTable} className="admin-cta-button primary small">
          <FaPlusCircle /> Add New Table
        </button>
      </div>

      {tablesArray.length > 0 ? (
        <div className="tables-list">
          {tablesArray.map((table) => (
            <div className="table-item-card" key={table.id}>
              <div className="table-info">
                <span className="table-name">{table.name}</span>
                {table.capacity && <span className="table-capacity">Capacity: {table.capacity}</span>}
                <span className={`table-status ${table.isActive ? 'active' : 'inactive'}`}>
                  {table.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="table-actions">
                <button 
                    onClick={() => handleShowQrCode(table)} 
                    className="admin-icon-button qr-btn" 
                    aria-label="Show QR Code"
                >
                  <FaQrcode /> <span>QR</span>
                </button>
                <button 
                    onClick={() => handleEditTable(table)} 
                    className="admin-icon-button edit-btn" 
                    aria-label="Edit Table"
                >
                  <FaEdit /> <span>Edit</span>
                </button>
                <button 
                    onClick={() => handleDeleteTable(table.id, table.name)} 
                    className="admin-icon-button delete-btn" 
                    aria-label="Delete Table"
                >
                  <FaTrashAlt /> <span>Delete</span>
                </button>
              </div>
              {showingQrForTableId === table.id && table.id && (
                <div className="qr-code-display-section">
                  <QRCodeGenerator 
                    // Value for QR code: e.g., link to menu with table ID pre-selected
                    value={`${window.location.origin}/menu/${restaurantId}?table=${table.id}`} 
                    logoSrc={restaurant.icon || restaurant.imageUrl} // Pass restaurant logo
                    size={180}
                    fileName={`QR_Table_${table.name.replace(/\s+/g, '_')}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-tables-message">No tables configured yet. Add your first table!</p>
      )}
    </div>
  );
};

export default AdminTableManager;
