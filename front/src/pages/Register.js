import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('donor');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    bloodType: '',
    organs: '',
    neededBloodType: '',
    neededOrgan: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userType = sessionStorage.getItem('userType');

    if (token && userType) {
      navigate(userType === 'donor' ? '/donor-dashboard' : '/recipient-dashboard');
    }
  }, [navigate]);

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    switch (name) {
      case 'fullName': validateName(value); break;
      case 'email': validateEmail(value); break;
      case 'password': validatePassword(value); break;
      case 'confirmPassword': validateConfirmPassword(value); break;
      default: break;
    }
  };

  const validateName = (name) => {
    const valid = name.trim().length >= 2;
    setErrors(prev => ({ ...prev, fullName: valid ? '' : 'Please enter your name' }));
    return valid;
  };

  const validateEmail = (email) => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    setErrors(prev => ({ ...prev, email: valid ? '' : 'Please enter a valid email' }));
    return valid;
  };

  const validatePassword = (password) => {
    const valid = password.length >= 6;
    setErrors(prev => ({ ...prev, password: valid ? '' : 'Password must be at least 6 characters' }));
    if (formData.confirmPassword) validateConfirmPassword(formData.confirmPassword);
    return valid;
  };

  const validateConfirmPassword = (confirmPassword) => {
    const valid = confirmPassword === formData.password;
    setErrors(prev => ({ ...prev, confirmPassword: valid ? '' : 'Passwords don\'t match' }));
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const valid =
      validateName(formData.fullName) &&
      validateEmail(formData.email) &&
      validatePassword(formData.password) &&
      validateConfirmPassword(formData.confirmPassword);

    if (!valid) return;

    const registrationData = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      userType,
      phoneNumber: formData.phoneNumber
    };

    if (userType === 'donor') {
      registrationData.bloodType = formData.bloodType;
      registrationData.organs = formData.organs;
    } else {
      registrationData.neededBloodType = formData.neededBloodType;
      registrationData.neededOrgan = formData.neededOrgan;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      let data;
      try {
        data = await response.clone().json();
      } catch (err) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Unexpected server response. Please try again later.');
      }

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.msg || 'Registration failed');
      }

      sessionStorage.setItem('authToken', data.token);
      sessionStorage.setItem('userType', data.userType);
      sessionStorage.setItem('userId', data.userId);
      sessionStorage.setItem('userName', data.userName);

      navigate(data.userType === 'donor' ? '/donor-dashboard' : '/recipient-dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      alert(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h2>Create Your Account</h2>
        </div>

        <div className="user-type-toggle">
          <button
            type="button"
            className={`toggle-btn ${userType === 'donor' ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('donor')}
          >
            I'm a Donor
          </button>
          <button
            type="button"
            className={`toggle-btn ${userType === 'recipient' ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('recipient')}
          >
            I'm a Recipient
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="userType" value={userType} />

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
            {errors.fullName && <div className="error-message">{errors.fullName}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password"
              required
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter your password"
              required
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>

          {userType === 'donor' && (
            <>
              <div className="form-group">
                <label htmlFor="bloodType">Blood Type</label>
                <select name="bloodType" value={formData.bloodType} onChange={handleInputChange}>
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="organs">Organs Willing to Donate</label>
                <input
                  type="text"
                  name="organs"
                  value={formData.organs}
                  onChange={handleInputChange}
                  placeholder="e.g., Kidney, Liver"
                />
              </div>
            </>
          )}

          {userType === 'recipient' && (
            <>
              <div className="form-group">
                <label htmlFor="neededBloodType">Needed Blood Type</label>
                <select name="neededBloodType" value={formData.neededBloodType} onChange={handleInputChange}>
                  <option value="">Not Applicable</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="neededOrgan">Needed Organ</label>
                <input
                  type="text"
                  name="neededOrgan"
                  value={formData.neededOrgan}
                  onChange={handleInputChange}
                  placeholder="e.g., Kidney, Liver"
                />
              </div>
            </>
          )}

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="login-link">
            Already have an account? <a href="/login">Login here</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
