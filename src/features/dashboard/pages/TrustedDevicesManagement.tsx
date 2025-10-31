import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { IoShieldCheckmarkOutline, IoPhonePortraitOutline } from 'react-icons/io5';

interface Device {
  id: string;
  name: string;
  os: string;
  lastLogin: string;
  status: 'trusted' | 'deactivated';
}

const TrustedDevicesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'iPhone 14 Pro Max',
      os: 'iOS',
      lastLogin: '02 Oct 2025-10:22 AM',
      status: 'trusted'
    },
    {
      id: '2',
      name: 'iPhone 14 Pro Max',
      os: 'iOS',
      lastLogin: '02 Oct 2025-10:22 AM',
      status: 'trusted'
    }
  ]);

  useEffect(() => {
    // Add dashboard-root class to root element
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('dashboard-root');
    }
    
    // Cleanup function to remove class when component unmounts
    return () => {
      if (root) {
        root.classList.remove('dashboard-root');
      }
    };
  }, []);

  const handleDeactivate = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      navigate('/app/account-settings/devices/deactivate', {
        state: { deviceId, deviceName: device.name }
      });
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Account & Settings</h1>
          
          <div className="account-settings-container" style={{ maxWidth: '600px' }}>
            {/* Trusted Devices Section */}
            <div className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon">
                  <IoShieldCheckmarkOutline size={35} color="#022466" />
                </div>
                <h2 className="section-title" style={{ margin: 0 }}>Trusted Devices Management</h2>
              </div>

              {/* Main Title and Description */}
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                  <IoShieldCheckmarkOutline size={50} color="#022466" />
                </div>
                <h3 style={{ 
                  fontFamily: 'Manrope, sans-serif', 
                  fontWeight: 600, 
                  fontSize: '20px', 
                  lineHeight: '28px',
                  color: '#1F2937',
                  margin: '0 0 8px 0' 
                }}>
                  Trusted Devices
                </h3>
                <p style={{ 
                  fontFamily: 'Hanken Grotesk, sans-serif', 
                  fontWeight: 400, 
                  fontSize: '16px', 
                  lineHeight: '24px',
                  color: '#6B7280',
                  margin: 0 
                }}>
                  Manage the devices that can access your wallet.
                </p>
              </div>

              {/* Device List */}
              <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {devices.map((device) => (
                  <div 
                    key={device.id} 
                    style={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0 }}>
                        <IoPhonePortraitOutline size={24} color="#022466" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontFamily: 'Manrope, sans-serif',
                          fontWeight: 600,
                          fontSize: '16px',
                          lineHeight: '24px',
                          color: '#1F2937',
                          margin: '0 0 4px 0'
                        }}>
                          {device.name}
                        </h3>
                        <p style={{ 
                          fontFamily: 'Hanken Grotesk, sans-serif',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '20px',
                          color: '#6B7280',
                          margin: '0 0 8px 0'
                        }}>
                          {device.os}
                        </p>
                        <p style={{ 
                          fontFamily: 'Hanken Grotesk, sans-serif',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '20px',
                          color: '#6B7280',
                          margin: '0 0 8px 0'
                        }}>
                          Last Login: {device.lastLogin}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {device.status === 'trusted' && (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span style={{ color: '#22C55E', fontSize: '14px', fontWeight: 500 }}>Trusted</span>
                            </>
                          )}
                          {device.status === 'deactivated' && (
                            <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: 500 }}>Deactivated</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {device.status === 'trusted' && (
                      <button
                        onClick={() => handleDeactivate(device.id)}
                        style={{
                          padding: '8px 20px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          background: '#F9FAFB',
                          color: '#6B7280',
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#EF4444';
                          e.currentTarget.style.borderColor = '#EF4444';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#F9FAFB';
                          e.currentTarget.style.borderColor = '#D1D5DB';
                          e.currentTarget.style.color = '#6B7280';
                        }}
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustedDevicesManagement;

