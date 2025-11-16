import React, { createContext, useContext, useReducer, useEffect } from 'react';
import configuration from '../configuration';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || '',
  isLoggedIn: !!localStorage.getItem('token'),
};

const SET_USER = 'SET_USER';
const LOGOUT = 'LOGOUT';

const reducer = (state, action) => {
  switch (action.type) {
    case SET_USER:
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoggedIn: true,
      };
    case LOGOUT:
      localStorage.clear();
      return {
        user: null,
        token: '',
        isLoggedIn: false,
      };
    default:
      return state;
  }
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      dispatch({ type: SET_USER, payload: { user: storedUser, token: storedToken } });
    }
  }, []);

  const login = async ({ loginId, loginPassword }, setErrorMessage) => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL || ''}users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const decoded = JSON.parse(atob(data.token.split('.')[1]));

        // Do not store userId in localStorage
        const user = {
          loginId: data.user?.loginId,
          full_name: data.user?.full_name || '',
          role: data.user?.role || decoded.role,
          language: data.user?.language || 'en',
          timezone: data.user?.timezone || 'UTC',
          email: data.user?.email || '',
          companyId: data.user?.companyId || null,
          profile_picture_url: data.user?.profile_picture_url || '',
          status: data.user?.status || 'pending',
          created_at: data.user?.created_at || new Date().toISOString(),
          // userId is kept in memory, not stored
        };

        // Store user and token (excluding userId)
        dispatch({ type: SET_USER, payload: { user, token: data.token } });
      } else {
        setErrorMessage(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Internal server error');
    }
  };

  const logout = async (email) => {
    try {
      await fetch(`${configuration.API_BASE_URL || ''}users/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    dispatch({ type: LOGOUT });
  };

  return (
    <AppContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
