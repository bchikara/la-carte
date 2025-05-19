// src/components/Admin/Settings/RestaurantDetailsForm.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent, useMemo } from 'react';
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import { Restaurant } from '../../types/restaurant.types'; // Adjust path
import './RestaurantDetailsForm.scss'; // We'll create this
import { FaSave, FaSpinner, FaImage, FaUpload } from 'react-icons/fa';
import DefaultRestaurantImage from '../../assets/icons/default-restaurant.png'; // Add a default restaurant placeholder

interface RestaurantDetailsFormProps {
  restaurant: Restaurant;
  restaurantId: string;
}

// Fields that can be directly edited in this form
type EditableRestaurantDetails = Pick<Restaurant, 'name' | 'description' | 'operatingHours' | 'email' | 'phone' | 'address' | 'website' | 'location' | 'cuisineType'>;

const RestaurantDetailsForm: React.FC<RestaurantDetailsFormProps> = ({ restaurant, restaurantId }) => {
  const { updateRestaurantDetails, isLoadingDetails } = useRestaurantStore();

  const [formData, setFormData] = useState<EditableRestaurantDetails>({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    location: '',
    cuisineType: [],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(restaurant.imageUrl || restaurant.icon || DefaultRestaurantImage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        email: restaurant.email || '',
        phone: restaurant.phone || '',
        address: restaurant.address || '',
        website: restaurant.website || '',
        location: restaurant.location || '',
        cuisineType: restaurant.cuisineType || [],
      });
      setImagePreview(restaurant.imageUrl || restaurant.icon || DefaultRestaurantImage);
      setImageFile(null); // Reset file on restaurant change
    }
  }, [restaurant]);

  useEffect(() => {
    if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(imageFile);
    } else if (restaurant?.imageUrl || restaurant?.icon) {
        setImagePreview(restaurant.imageUrl || restaurant.icon || DefaultRestaurantImage);
    } else {
        setImagePreview(DefaultRestaurantImage);
    }
  }, [imageFile, restaurant?.imageUrl, restaurant?.icon]);


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCuisineTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Assuming cuisineType is a comma-separated string in the input
    const cuisines = e.target.value.split(',').map(c => c.trim()).filter(c => c);
    setFormData(prev => ({ ...prev, cuisineType: cuisines }));
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Restaurant name is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await updateRestaurantDetails(restaurantId, formData, imageFile);
      // Optionally show success message via snackbar
      alert("Restaurant details updated successfully!");
      setImageFile(null); // Clear selected file after successful upload
    } catch (error) {
      console.error("Failed to update restaurant details:", error);
      alert(`Failed to update details: ${error}`);
      // Optionally show error message via snackbar
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormChanged = useMemo(() => {
    if (!restaurant) return false;
    return (
        formData.name !== (restaurant.name || '') ||
        formData.description !== (restaurant.description || '') ||
        formData.operatingHours !== (restaurant.operatingHours || '') ||
        formData.email !== (restaurant.email || '') ||
        formData.phone !== (restaurant.phone || '') ||
        formData.address !== (restaurant.address || '') ||
        formData.website !== (restaurant.website || '') ||
        formData.location !== (restaurant.location || '') ||
        JSON.stringify(formData.cuisineType?.sort()) !== JSON.stringify(restaurant.cuisineType?.sort() || []) ||
        imageFile !== null
    );
  }, [formData, imageFile, restaurant]);

  return (
    <form onSubmit={handleSubmit} className="restaurant-details-form">
      <div className="form-grid">
        {/* Restaurant Image Upload */}
        <div className="form-field image-upload-field">
          <label>Restaurant Display Image</label>
          <div className="image-preview-container">
            <img src={imagePreview || DefaultRestaurantImage} alt="Restaurant" className="image-preview" />
            <label htmlFor="restaurantImageFile" className="upload-image-button">
              <FaUpload /> {imageFile ? "Change Image" : "Upload Image"}
            </label>
            <input
              type="file"
              id="restaurantImageFile"
              accept="image/*"
              onChange={handleImageFileChange}
              style={{ display: 'none' }}
              disabled={isSubmitting}
            />
          </div>
          {imageFile && <span className="file-name-display">Selected: {imageFile.name}</span>}
        </div>

        {/* Text Fields */}
        <div className="form-field">
          <label htmlFor="restaurantName">Restaurant Name</label>
          <input
            id="restaurantName"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-field">
          <label htmlFor="restaurantDescription">Description</label>
          <textarea
            id="restaurantDescription"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-field">
          <label htmlFor="restaurantLocation">Location (e.g., City, Area)</label>
          <input
            id="restaurantLocation"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Downtown, Springfield"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-field">
          <label htmlFor="restaurantCuisineType">Cuisine Types (comma-separated)</label>
          <input
            id="restaurantCuisineType"
            name="cuisineType"
            type="text"
            value={formData.cuisineType?.join(', ') || ''}
            onChange={handleCuisineTypeChange}
            placeholder="e.g., Italian, Mexican, Indian"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-field">
          <label htmlFor="restaurantPhone">Phone Number</label>
          <input
            id="restaurantPhone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-field">
          <label htmlFor="restaurantEmail">Email Address</label>
          <input
            id="restaurantEmail"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-field">
          <label htmlFor="restaurantAddress">Full Address</label>
          <textarea
            id="restaurantAddress"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-field">
          <label htmlFor="restaurantWebsite">Website (Optional)</label>
          <input
            id="restaurantWebsite"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://yourrestaurant.com"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="form-actions">
        <button 
            type="submit" 
            className="admin-cta-button primary" 
            disabled={isSubmitting || isLoadingDetails || !isFormChanged}
        >
          {isSubmitting || isLoadingDetails ? <FaSpinner className="spinner-icon inline" /> : <FaSave />}
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default RestaurantDetailsForm;
