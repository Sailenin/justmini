import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredUserType }) => {
  const token = sessionStorage.getItem('authToken');
  const userType = sessionStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;