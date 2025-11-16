// SessionChecker.js
import React, { useEffect } from 'react';
import configuration from '../../configuration';
import LogoutHandler from './LogoutHandler';
import { useAppContext } from '../context/AppContext';

const SessionChecker = () => {
  const { isLoggedIn, user } = useAppContext();
  const { handleLogout } = LogoutHandler();

  useEffect(() => {
    const checkInactivity = async () => {
      try {
        const response = await fetch(`${configuration.API_BASE_URL}auth/check-inactivity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user?.email }),
        });

        if (response.status === 401) {
          handleLogout();
        }
      } catch (err) {
        console.error('Inactivity check failed:', err);
      }
    };

    const interval = setInterval(() => {
      if (isLoggedIn) checkInactivity();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [isLoggedIn, user, handleLogout]);

  return null; // No visual output
};

export default SessionChecker;