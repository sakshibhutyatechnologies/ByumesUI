import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../Context/AppContext';

const RequireAuth = ({ children }) => {
  const { isLoggedIn } = useAppContext();

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAuth;