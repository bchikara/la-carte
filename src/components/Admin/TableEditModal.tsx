// src/components/Admin/Settings/TableEditModal.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import { RestaurantTable } from '../../types/restaurant.types'; // Adjust path
import './TableEditModal.scss'; // We'll create this SCSS file
import { FaTimes, FaSpinner, FaSave } from 'react-icons/fa';

interface TableEditModalProps {
  restaurantId: string;
  // editingItem (table) and modal visibility will come from the store's menuEditing state
}

const TableEditModal: React.FC<TableEditModalProps> = ({ restaurantId }) => {
  const {
    menuEditing, // Contains isTableModalOpen and editingItem (which could be a RestaurantTable)
    closeTableModal,
    addRestaurantTable,
    updateRestaurantTable,
  } = useRestaurantStore();

  const isEditing = !!menuEditing.editingItem && menuEditing.editingItemType === 'table';
  const currentTable = menuEditing.editingItem as RestaurantTable | null;

  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState<string | number>('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (menuEditing.isTableModalOpen) {
      if (isEditing && currentTable) {
        setTableName(currentTable.name || '');
        setCapacity(currentTable.capacity || '');
        setIsActive(currentTable.isActive === undefined ? true : currentTable.isActive); // Default to true if undefined
      } else {
        // Reset for new table
        setTableName('');
        setCapacity('');
        setIsActive(true);
      }
    }
  }, [isEditing, currentTable, menuEditing.isTableModalOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) {
      alert('Please enter a table name or number.');
      return;
    }
    if (!restaurantId) {
        alert("Restaurant context is missing.");
        return;
    }

    setIsLoading(true);

    const tableData: Partial<Omit<RestaurantTable, 'id' | 'qrCodeValue'>> = {
      name: tableName.trim(),
      capacity: Number(capacity) || '', // Store as number or undefined if empty
      isActive: isActive,
    };

    try {
      if (isEditing && currentTable && currentTable.id) {
        await updateRestaurantTable(restaurantId, currentTable.id, tableData);
      } else {
        // For adding, the service should generate the ID and QR code value
        await addRestaurantTable(restaurantId, tableData as Omit<RestaurantTable, 'id' | 'qrCodeValue'>);
      }
      closeTableModal();
    } catch (error) {
      console.error(`Error saving table:`, error);
      alert(`Error saving table: ${error}`);
      // Consider using a snackbar for error reporting
    } finally {
      setIsLoading(false);
    }
  };

  if (!menuEditing.isTableModalOpen) {
    return null;
  }

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content table-edit-modal">
        <header className="admin-modal-header">
          <h2>{isEditing ? 'Edit Table' : 'Add New Table'}</h2>
          <button onClick={closeTableModal} className="close-modal-btn" aria-label="Close modal">
            <FaTimes />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="form-field">
            <label htmlFor="tableName">Table Name/Number</label>
            <input
              id="tableName"
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="e.g., Table 1, T1, Patio 5"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-field">
            <label htmlFor="tableCapacity">Capacity (Optional)</label>
            <input
              id="tableCapacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g., 4"
              min="1"
              disabled={isLoading}
            />
          </div>
          <div className="form-field checkbox-field">
            <input
              id="tableIsActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="tableIsActive">Table is Active</label>
          </div>
          <div className="admin-modal-actions">
            <button type="button" onClick={closeTableModal} className="cta-button tertiary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="cta-button primary" disabled={isLoading}>
              {isLoading ? <FaSpinner className="spinner-icon inline" /> : <FaSave />}
              {isEditing ? 'Save Changes' : 'Add Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableEditModal;
