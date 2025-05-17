// src/pages/ProfilePage/ProfilePage.tsx
import React, { useState, useEffect, ChangeEvent, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../../store/userStore'; // Adjust path
import './Profile.scss'; 

// Using react-icons for icons
import { FaCamera, FaSignOutAlt, FaShoppingBasket, FaSpinner, FaSave, FaUserCircle } from 'react-icons/fa';
import DefaultAvatar from '../../assets/icons/Profile.svg'; // Ensure this path is correct or use FaUserCircle

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { 
        currentUser, 
        firebaseUser, 
        isLoading, 
        error, 
        signOutUser, 
        updateUserProfile 
    } = useUserStore();

    const [newDisplayName, setNewDisplayName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentUser) {
            setNewDisplayName(currentUser.displayName || '');
            setImagePreview(currentUser.profileImageUrl || DefaultAvatar);
        } else if (!isLoading && !firebaseUser) {
            navigate('/login');
        }
    }, [currentUser, isLoading, firebaseUser, navigate]);

    useEffect(() => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            // Revert to current user's image or default if file is cleared
             setImagePreview(currentUser?.profileImageUrl || DefaultAvatar);
        }
    }, [selectedFile, currentUser?.profileImageUrl]);


    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewDisplayName(e.target.value);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const isProfileChanged = useMemo(() => {
        return (newDisplayName.trim() !== (currentUser?.displayName || '')) || selectedFile !== null;
    }, [newDisplayName, selectedFile, currentUser?.displayName]);


    const handleSaveProfile = async () => {
        if (!firebaseUser?.uid) return;
        if (!isProfileChanged) {
            // alert("No changes to save."); // Optional: inform user
            return;
        }
        if (!newDisplayName.trim() && !selectedFile && !currentUser?.displayName) {
             alert("Display name cannot be empty if no image is being uploaded.");
             return;
        }


        setIsUpdatingProfile(true);
        try {
            await updateUserProfile(firebaseUser.uid, {
                displayName: newDisplayName.trim() !== currentUser?.displayName ? newDisplayName.trim() : currentUser?.displayName, // Send current name if input is empty but an image is selected
                profileImageFile: selectedFile || undefined,
            });
            setSelectedFile(null); 
        } catch (e) {
            console.error("Profile update failed:", e);
            // Show error via snackbar from store if implemented
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleLogout = async () => {
        await signOutUser();
        navigate('/'); 
    };

    if (isLoading || (!currentUser && firebaseUser)) { 
        return (
            <div className="ProfilePage loading-state">
                <FaSpinner className="spinner-icon" />
                <p>Loading Profile...</p>
            </div>
        );
    }

    if (error) {
        return <div className="ProfilePage error-state">Error: {error}</div>;
    }

    if (!currentUser) {
        return <div className="ProfilePage error-state">User profile not found. Please try logging in again.</div>;
    }

    return (
        <div className="ProfilePage">
            <div className="profile-content-wrapper section-padding">
                <header className="profile-page-header">
                    <h1 className="section-title">My Profile</h1>
                </header>

                <section className="profile-main-content">
                    <div className="profile-avatar-section">
                        <div className="avatar-container" onClick={handleImageClick} title="Change profile photo">
                            <img 
                                src={imagePreview || DefaultAvatar} 
                                alt="Profile" 
                                className="profile-avatar" 
                            />
                            <div className="avatar-edit-overlay">
                                <FaCamera />
                            </div>
                        </div>
                        <input 
                            type="file" 
                            id="profileImageUpload" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            disabled={isUpdatingProfile}
                        />
                    </div>

                    <div className="profile-form-section">
                        <div className="form-field">
                            <label htmlFor="displayName">Name</label>
                            <input 
                                type="text" 
                                id="displayName" 
                                className="name-input"
                                value={newDisplayName} 
                                onChange={handleNameChange}
                                placeholder="Enter your name"
                                disabled={isUpdatingProfile}
                            />
                        </div>

                        <div className="form-field">
                            <label>Phone</label>
                            <span className="phone-display">{currentUser.phone}</span>
                        </div>
                        
                        {isProfileChanged && (
                             <button 
                                onClick={handleSaveProfile} 
                                className="cta-button primary save-profile-button"
                                disabled={isUpdatingProfile}
                            >
                                {isUpdatingProfile ? <><FaSpinner className="spinner-icon inline"/> Saving...</> : <><FaSave /> Save Changes</>}
                            </button>
                        )}
                    </div>

                    <div className="profile-links-section">
                        <Link to="/my-orders" className="profile-action-link">
                            <FaShoppingBasket /> My Orders
                        </Link>
                        <div onClick={handleLogout} className="profile-action-link logout-link" role="button" tabIndex={0}>
                            <FaSignOutAlt /> Logout
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;

export {};
