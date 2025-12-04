import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import yourLocationIcon from '../../../assets/card-service/your-location.svg';
import currentLocationIcon from '../../../assets/card-service/current-location.svg';
import '../../../styles/dashboard.css';

const SelectOnMap: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { 
    cardType?: 'mada' | 'mastercard'; 
    fee?: number;
    address?: string;
  } | null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('1234 Elm Street, Ashok Nagar');
  const [mapCenter, setMapCenter] = useState({ lat: 24.7136, lng: 46.6753 }); // Default to Riyadh
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize map (placeholder for now - would use actual map library in production)
    // For now, we'll use a static map image or iframe
  }, []);

  const handleBack = () => {
    navigate('/app/services/cards/request-physical/delivery', {
      state: { 
        cardType: state?.cardType,
        fee: state?.fee
      }
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality with map library
    console.log('Searching for:', searchQuery);
  };

  const handleUseBrowserLocation = () => {
    navigate('/app/services/cards/request-physical/delivery/map/browser-location', {
      state: { 
        cardType: state?.cardType,
        fee: state?.fee
      }
    });
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // TODO: Get coordinates from map click
    // For now, just update the address
    setSelectedAddress('1234 Elm Street, Ashok Nagar');
  };

  const handleConfirmLocation = () => {
    // Navigate back to delivery location screen with updated address
    navigate('/app/services/cards/request-physical/delivery', {
      state: { 
        cardType: state?.cardType,
        fee: state?.fee,
        address: selectedAddress,
        fromMap: true
      }
    });
  };

  const handleZoomIn = () => {
    // TODO: Implement zoom in
    console.log('Zoom in');
  };

  const handleZoomOut = () => {
    // TODO: Implement zoom out
    console.log('Zoom out');
  };

  const handleCenterMap = () => {
    handleUseBrowserLocation();
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Cards</h1>
          
          <div className="select-on-map-screen">
            {/* Header - Outside Container */}
            <div className="select-on-map-header">
              <h2 className="select-on-map-title">Delivery Location – Select on Map</h2>
              <p className="select-on-map-subtitle">
                Choose your delivery location by searching or selecting a point on the map.
              </p>
            </div>

            <div className="select-on-map-container">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="select-on-map-search">
                <div className="select-on-map-search-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location / address"
                  className="select-on-map-search-input"
                />
              </form>

              {/* Map Container */}
              <div className="select-on-map-map-container">
                <div 
                  ref={mapRef}
                  className="select-on-map-map"
                  onClick={handleMapClick}
                >
                  {/* Map placeholder - in production, this would be an actual map component (e.g., Google Maps, Leaflet) */}
                  <div className="select-on-map-map-placeholder">
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      background: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6B7280',
                      fontFamily: 'Arial',
                      fontSize: '16px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <p>Map View</p>
                        <p style={{ fontSize: '12px', marginTop: '8px' }}>Click anywhere on the map to select location</p>
                      </div>
                    </div>
                  </div>

                  {/* Location Pin */}
                  <div className="select-on-map-pin">
                    <img src={yourLocationIcon} alt="Selected Location" />
                  </div>

                  {/* Map Controls */}
                  <div className="select-on-map-controls">
                    <div className="select-on-map-zoom-controls">
                      <button 
                        className="select-on-map-zoom-button select-on-map-zoom-in"
                        onClick={handleZoomIn}
                        aria-label="Zoom in"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5v14M5 12h14" stroke="#022466" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                      <div className="select-on-map-zoom-divider"></div>
                      <button 
                        className="select-on-map-zoom-button select-on-map-zoom-out"
                        onClick={handleZoomOut}
                        aria-label="Zoom out"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12h14" stroke="#022466" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                    <button 
                      className="select-on-map-location-button"
                      onClick={handleCenterMap}
                      aria-label="Center on location"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  {/* Use Browser Location Button */}
                  <button 
                    className="select-on-map-browser-location"
                    onClick={handleUseBrowserLocation}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#022466" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Use Browser Location</span>
                  </button>
                </div>
              </div>

              {/* Selected Location Display */}
              <div className="select-on-map-selected-location">
                <div className="select-on-map-selected-location-icon">
                  <img src={yourLocationIcon} alt="Location" />
                </div>
                <div className="select-on-map-selected-location-content">
                  <span className="select-on-map-selected-location-label">Selected Location</span>
                  <span className="select-on-map-selected-location-address">{selectedAddress}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Confirm Button - Outside Container */}
            <button 
              className="select-on-map-confirm-button"
              onClick={handleConfirmLocation}
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectOnMap;

