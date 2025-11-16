import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../Context/AppContext';
import UserProfile from './UserProfile';
import { FaHome } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Style/Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { user, logout } = useAppContext();

  const handleNavigate = (route) => {
    navigate(route);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  // close mobile menu when clicking outside
  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      {/* Home icon */}
      <button
        className="navbar-brand btn text-white p-0"
        onClick={() => handleNavigate('/')}
      >
        <FaHome size={20} />
      </button>

      {/* MOBILE: Hamburger + custom dropdown */}
      <div className="position-relative d-lg-none" ref={menuRef}>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {menuOpen && (
          <ul className="mobile-menu dropdown-menu show">
            {user?.role === 'Admin' && user?.role ==='QA' &&  user?.role ==='Operator' (
              <>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleNavigate('/userManagement')}
                  >
                    User Management
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleNavigate('/orders')}
                  >
                    Orders
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleNavigate('/eLogOrders')}
                  >
                    eLog Orders
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleNavigate('/products')}
                  >
                    Products
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleNavigate('/equipmentTypes')}
                  >
                    Equipment Types
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleNavigate('/equipmentActivities')}
                  >
                    Equipment Activities
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleNavigate('/images')}
                  >
                    Images
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleNavigate('/gifs')}
                  >
                    GIFs
                  </button>
                </li>
              </>
            )}
          </ul>
        )}
      </div>

      {/* DESKTOP: horizontal nav + dropdowns */}
      {user?.role === 'Admin' && (
        <ul className="navbar-nav ms-3 d-none d-lg-flex align-items-center">
          <li className="nav-item">
            <button
              className="nav-link btn text-white"
              onClick={() => handleNavigate('/userManagement')}
            >
              User Management
            </button>
          </li>
          <li className="nav-item dropdown">
            <button
              className="nav-link dropdown-toggle btn text-white"
              data-bs-toggle="dropdown"
            >
              Orders
            </button>
            <ul className="dropdown-menu">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleNavigate('/orders')}
                >
                  Orders
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleNavigate('/eLogOrders')}
                >
                  eLog Orders
                </button>
              </li>
            </ul>
          </li>
          <li className="nav-item">
            <button
              className="nav-link btn text-white"
              onClick={() => handleNavigate('/products')}
            >
              Products
            </button>
          </li>
          <li className="nav-item dropdown">
            <button
              className="nav-link dropdown-toggle btn text-white"
              data-bs-toggle="dropdown"
            >
              Equipment
            </button>
            <ul className="dropdown-menu">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleNavigate('/equipmentTypes')}
                >
                  Equipment Types
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleNavigate('/equipmentActivities')}
                >
                  Equipment Activities
                </button>
              </li>
            </ul>
          </li>
          <li className="nav-item dropdown">
            <button
              className="nav-link dropdown-toggle btn text-white"
              data-bs-toggle="dropdown"
            >
              Media
            </button>
            <ul className="dropdown-menu">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleNavigate('/images')}
                >
                  Images
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleNavigate('/gifs')}
                >
                  GIFs
                </button>
              </li>
            </ul>
          </li>
        </ul>
      )}

      {/* user-profile on the right */}
      <div className="ms-auto d-flex align-items-center">
        {user && <UserProfile user={user} onLogout={handleLogout} />}
      </div>
    </nav>
  );
};

export default Navbar;