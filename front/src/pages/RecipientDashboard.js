import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUser,
  FaSignOutAlt, 
  FaBell, 
  FaSearch,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import '../styles/recipient.css';

const DEFAULT_PROFILE_IMAGE = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const RecipientDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [recipientData, setRecipientData] = useState(null);
  const [bloodDonors, setBloodDonors] = useState([]);
  const [organDonors, setOrganDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDonorId, setExpandedDonorId] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const response = await fetch('http://localhost:5000/api/recipient/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const data = await response.json();
      
      const normalizedOrganDonors = data.donors.organDonors.map(donor => ({
        ...donor,
        organs: typeof donor.organs === 'string' ? donor.organs.split(',') : donor.organs || []
      }));

      setRecipientData(data.recipientInfo);
      setBloodDonors(data.donors.bloodDonors);
      setOrganDonors(normalizedOrganDonors);
      
    } catch (err) {
      setError(err.message);
      if (err.message.includes('authentication')) {
        sessionStorage.clear();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const handleShowDetails = (donorId) => {
    setExpandedDonorId(expandedDonorId === donorId ? null : donorId);
  };

  const DonorCard = ({ donor, type }) => {
    const getInitials = (name) => {
      if (!name) return 'D';
      const names = name.split(' ');
      return names.map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    const isExpanded = expandedDonorId === donor._id;

    return (
      <div className={`donor-card ${isExpanded ? 'expanded' : ''}`}>
        <div className="donor-header">
          <div className="avatar-container">
            {donor.profileImage ? (
              <img src={donor.profileImage} alt="Donor" className="donor-avatar" />
            ) : (
              <div className="default-avatar">
                {getInitials(donor.fullName)}
              </div>
            )}
          </div>
          <div className="donor-info">
            <h3>{donor.fullName || 'Anonymous Donor'}</h3>
            <p>{donor.age ? `${donor.age} years old` : 'Age not specified'}</p>
          </div>
        </div>
        <div className="donor-details">
          {type === 'blood' && (
            <div className="detail-row">
              <span className="detail-label">Blood Type:</span>
              <span className="blood-type">{donor.bloodType || 'N/A'}</span>
            </div>
          )}
          {type === 'organ' && (
            <div className="detail-row">
              <span className="detail-label">Organs:</span>
              <span>
                {Array.isArray(donor.organs) 
                  ? donor.organs.join(', ') 
                  : donor.organs || 'N/A'}
              </span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Location:</span>
            <span>{donor.location || 'Location not specified'}</span>
          </div>

          {isExpanded && (
            <div className="contact-details">
              {type === 'blood' ? (
                <>
                  <div className="contact-item">
                    <FaPhone className="contact-icon" />
                    <span>{donor.phoneNumber || 'Phone number not available'}</span>
                  </div>
                  <div className="contact-item">
                    <FaEnvelope className="contact-icon" />
                    <span>{donor.email || 'Email not available'}</span>
                  </div>
                </>
              ) : (
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <span>{donor.email || 'Email not available'}</span>
                </div>
              )}
            </div>
          )}

          <button 
            className="details-btn"
            onClick={() => handleShowDetails(donor._id)}
          >
            {isExpanded ? 'Hide Details' : 'Get Details'}
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    switch(activeMenu) {
      case 'dashboard':
        return (
          <>
            <div className="welcome-section">
              <h1>Welcome, {recipientData?.fullName || 'Recipient'}</h1>
              <div className="medical-needs">
                {recipientData?.neededBloodType && (
                  <p>Blood Type Needed: <strong>{recipientData.neededBloodType}</strong></p>
                )}
                {recipientData?.neededOrgan && (
                  <p>Organ Needed: <strong>{recipientData.neededOrgan}</strong></p>
                )}
              </div>
            </div>

            <h2>Available Blood Donors</h2>
            <div className="donors-grid">
              {bloodDonors.map((donor) => (
                <DonorCard key={donor._id} donor={donor} type="blood" />
              ))}
              {bloodDonors.length === 0 && <p className="no-donors">No blood donors available</p>}
            </div>

            <h2>Available Organ Donors</h2>
            <div className="donors-grid">
              {organDonors.map((donor) => (
                <DonorCard key={donor._id} donor={donor} type="organ" />
              ))}
              {organDonors.length === 0 && <p className="no-donors">No organ donors available</p>}
            </div>
          </>
        );

      case 'profile':
        return (
          <div className="profile-details-section">
            <h2>Your Profile Details</h2>
            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">Full Name:</span>
                <span>{recipientData?.fullName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span>{recipientData?.email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone Number:</span>
                <span>{recipientData?.phoneNumber || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span>{recipientData?.address || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Medical History:</span>
                <span>{recipientData?.medicalHistory || 'No medical history recorded'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Required Blood Type:</span>
                <span className="blood-type">
                  {recipientData?.neededBloodType || 'Not specified'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Required Organ:</span>
                <span>{recipientData?.neededOrgan || 'Not specified'}</span>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a menu item</div>;
    }
  };

  return (
    <div className="recipient-dashboard">
      <div className="sidebar">
        <div className="profile-section">
          <div className="avatar-container">
            <img
              src={recipientData?.profileImage || DEFAULT_PROFILE_IMAGE}
              alt="Profile"
              className="profile-img"
            />
          </div>
          <h2>{recipientData?.fullName || 'Loading...'}</h2>
          <p>Recipient</p>
        </div>

        <div className="nav-menu">
          <div 
            className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setActiveMenu('dashboard')}
          >
            <FaTachometerAlt className="nav-icon" />
            <span>Dashboard</span>
          </div>
          
          <div 
            className={`nav-item ${activeMenu === 'profile' ? 'active' : ''}`} 
            onClick={() => setActiveMenu('profile')}
          >
            <FaUser className="nav-icon" />
            <span>Profile</span>
          </div>
          
          <div className="nav-item" onClick={handleLogout}>
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="top-bar">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search donors..." />
          </div>
          <div className="user-menu">
            <FaBell className="notification-icon" />
          </div>
        </div>
        
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default RecipientDashboard;