import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Carry the page the user was trying to reach in route state, so the
    // Login page can send them back after a successful login.
    return (
      <Navigate
        to="/login"
        state={{ from: location, message: 'Please log in to continue.' }}
        replace
      />
    );
  }

  return children;
}
