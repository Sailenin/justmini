import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faHeartbeat,
  faCalendarAlt,
  faUser,
  faCog,
  faSignOutAlt,
  faSearch,
  faBell,
} from '@fortawesome/free-solid-svg-icons';

function DonorDashboard() {
  const [activeSection, setActiveSection] = useState('dashboardSection');
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    bloodType: '',
    organs: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userType = sessionStorage.getItem('userType');

    if (!token || userType !== 'donor') {
      window.location.href = '/login';
      return;
    }

    const fetchDonorInfo = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/donor/info', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch profile data');
        }

        const data = await response.json();
        setProfileData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonorInfo();
  }, []);

  const navigate = (sectionId) => {
    setActiveSection(sectionId);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const handleAppointmentSubmit = (event) => {
    event.preventDefault();
    alert('Appointment scheduled successfully!');
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const token = sessionStorage.getItem('authToken');
    setError('');
    
    try {
      const response = await fetch('/api/donor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setProfileData(data.data);
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSettingsSubmit = (event) => {
    event.preventDefault();
    alert('Settings saved successfully!');
  };

  if (loading) {
    return <div className="loading-message">Loading profile information...</div>;
  }

  if (error) {
    return <div className="error-message">Error loading profile: {error}</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="profile-section">
          <div className="profile-img">
            <FontAwesomeIcon icon={faUser} size="2x" color="#777" />
          </div>
          <h2 id="sidebarUserName">{profileData.fullName || 'Donor'}</h2>
          <p>Blood Donor</p>
        </div>

        <div className="nav-menu">
          <div
            className={`nav-item ${activeSection === 'dashboardSection' ? 'active' : ''}`}
            onClick={() => navigate('dashboardSection')}
          >
            <FontAwesomeIcon icon={faTachometerAlt} />
            <span>Dashboard</span>
          </div>
          <div
            className={`nav-item ${activeSection === 'historySection' ? 'active' : ''}`}
            onClick={() => navigate('historySection')}
          >
            <FontAwesomeIcon icon={faHeartbeat} />
            <span>Donation History</span>
          </div>
          <div
            className={`nav-item ${activeSection === 'appointmentsSection' ? 'active' : ''}`}
            onClick={() => navigate('appointmentsSection')}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Appointments</span>
          </div>
          <div
            className={`nav-item ${activeSection === 'profileSection' ? 'active' : ''}`}
            onClick={() => navigate('profileSection')}
          >
            <FontAwesomeIcon icon={faUser} />
            <span>Profile</span>
          </div>
          <div
            className={`nav-item ${activeSection === 'settingsSection' ? 'active' : ''}`}
            onClick={() => navigate('settingsSection')}
          >
            <FontAwesomeIcon icon={faCog} />
            <span>Settings</span>
          </div>
          <div className="nav-item" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="top-bar">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input type="text" placeholder="Search..." />
          </div>

          <div className="user-menu">
            <div className="notification-icon">
              <FontAwesomeIcon icon={faBell} />
              <span className="notification-badge">3</span>
            </div>
            <div className="user-avatar">
              <FontAwesomeIcon icon={faUser} color="#777" />
            </div>
          </div>
        </div>

        {/* Dashboard Section */}
        <div
          className="dashboard-content"
          style={{ display: activeSection === 'dashboardSection' ? 'block' : 'none' }}
        >
          <div className="welcome-section">
            <h1>Welcome back, {profileData.fullName ? profileData.fullName.split(' ')[0] : 'Donor'}!</h1>
            <p>Thank you for being a life-saver. Your donations make a difference.</p>
          </div>

          <div className="stats-cards">
            <div className="stat-card">
              <h3>Total Donations</h3>
              <p>8</p>
            </div>
            <div className="stat-card">
              <h3>Last Donation</h3>
              <p>2 months ago</p>
            </div>
            <div className="stat-card">
              <h3>Next Eligible</h3>
              <p>Ready now</p>
            </div>
            <div className="stat-card">
              <h3>Lives Impacted</h3>
              <p>12</p>
            </div>
          </div>

          <div className="donation-card">
            <h2>Recent Donations</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Center</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>15 June 2023</td>
                  <td>Blood</td>
                  <td>City Blood Bank</td>
                  <td>
                    <span className="status-badge status-completed">Completed</span>
                  </td>
                  <td>
                    <button className="btn btn-outline">Details</button>
                  </td>
                </tr>
                <tr>
                  <td>10 April 2023</td>
                  <td>Plasma</td>
                  <td>Central Hospital</td>
                  <td>
                    <span className="status-badge status-completed">Completed</span>
                  </td>
                  <td>
                    <button className="btn btn-outline">Details</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Donation History Section */}
        <div
          className="dashboard-content"
          style={{ display: activeSection === 'historySection' ? 'block' : 'none' }}
        >
          <div className="donation-card">
            <h2>Your Donation History</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Center</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>15 June 2023</td>
                  <td>Blood</td>
                  <td>City Blood Bank</td>
                  <td>1 unit</td>
                  <td>
                    <span className="status-badge status-completed">Completed</span>
                  </td>
                </tr>
                <tr>
                  <td>10 April 2023</td>
                  <td>Plasma</td>
                  <td>Central Hospital</td>
                  <td>1 unit</td>
                  <td>
                    <span className="status-badge status-completed">Completed</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointments Section */}
        <div
          className="dashboard-content"
          style={{ display: activeSection === 'appointmentsSection' ? 'block' : 'none' }}
        >
          <div className="donation-card">
            <h2>Upcoming Appointments</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Center</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>30 July 2023</td>
                  <td>10:00 AM</td>
                  <td>Blood</td>
                  <td>City Blood Bank</td>
                  <td>
                    <span className="status-badge status-pending">Scheduled</span>
                  </td>
                  <td>
                    <button className="btn btn-primary" style={{ marginRight: '5px' }}>
                      Confirm
                    </button>
                    <button className="btn btn-outline">Reschedule</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="donation-card" style={{ marginTop: '30px' }}>
            <h2>Schedule New Appointment</h2>
            <form onSubmit={handleAppointmentSubmit} style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label htmlFor="appointmentType">Donation Type</label>
                  <select id="appointmentType" className="form-control">
                    <option value="blood">Blood</option>
                    <option value="plasma">Plasma</option>
                    <option value="platelets">Platelets</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="appointmentDate">Date</label>
                  <input type="date" id="appointmentDate" className="form-control" />
                </div>
                <div className="form-group">
                  <label htmlFor="appointmentTime">Time</label>
                  <input type="time" id="appointmentTime" className="form-control" />
                </div>
                <div className="form-group">
                  <label htmlFor="appointmentCenter">Center</label>
                  <select id="appointmentCenter" className="form-control">
                    <option value="city-blood-bank">City Blood Bank</option>
                    <option value="central-hospital">Central Hospital</option>
                    <option value="red-cross">Red Cross Center</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>
                Schedule Appointment
              </button>
            </form>
          </div>
        </div>

        {/* Profile Section */}
        <div
          className="dashboard-content"
          style={{ display: activeSection === 'profileSection' ? 'block' : 'none' }}
        >
          <div className="donation-card">
            <h2>Your Profile</h2>
            <form onSubmit={handleProfileSubmit} style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className="form-control"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={profileData.email}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    className="form-control"
                    value={profileData.phoneNumber || ''}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bloodType">Blood Type</label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    className="form-control"
                    value={profileData.bloodType || ''}
                    onChange={handleProfileChange}
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="O+">O+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="A-">A-</option>
                    <option value="O-">O-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    className="form-control"
                    value={profileData.address || ''}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="organs">Organs Willing to Donate</label>
                  <input
                    type="text"
                    id="organs"
                    name="organs"
                    className="form-control"
                    value={profileData.organs || ''}
                    onChange={handleProfileChange}
                    placeholder="e.g., Kidney, Liver"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>
                Update Profile
              </button>
            </form>
          </div>
        </div>

        {/* Settings Section */}
        <div
          className="dashboard-content"
          style={{ display: activeSection === 'settingsSection' ? 'block' : 'none' }}
        >
          <div className="donation-card">
            <h2>Account Settings</h2>
            <form onSubmit={handleSettingsSubmit} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" className="form-control" />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input type="password" id="newPassword" className="form-control" />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input type="password" id="confirmPassword" className="form-control" />
              </div>
              <div className="form-group">
                <label htmlFor="notificationPref">Notification Preferences</label>
                <select id="notificationPref" className="form-control">
                  <option value="all">All Notifications</option>
                  <option value="important">Only Important</option>
                  <option value="none">No Notifications</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>
                Save Settings
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonorDashboard;