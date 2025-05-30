// components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const res = await axios.get('/api/admin/pending-users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setPendingUsers(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPendingUsers();
  }, []);

  const handleStatusUpdate = async (userId, status) => {
    try {
      await axios.put(`/api/admin/update-status/${userId}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Pending Registrations</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Registration Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingUsers.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleStatusUpdate(user._id, 'approved')}>
                  Approve
                </button>
                <button onClick={() => handleStatusUpdate(user._id, 'rejected')}>
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;