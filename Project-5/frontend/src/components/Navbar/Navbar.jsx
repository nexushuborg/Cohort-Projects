import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMode } from '../../context/ModeContext';
import Button from '../Button/Button';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { mode, setMode } = useMode();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ');

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarInner}>
        <Link to="/" className={styles.logo}>
          RideShare
          <span className={styles.logoDot} />
        </Link>

        {/* Desktop nav links */}
        <div className={styles.navLinks}>
          {isAuthenticated && (
            <>
              <div className={styles.modeToggle}>
                {['rider', 'driver'].map((m) => (
                  <button
                    key={m}
                    className={[styles.modeBtn, mode === m ? styles.modeBtnActive : '']
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setMode(m)}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>

              <NavLink to="/" className={navLinkClass} end onClick={() => setMobileOpen(false)}>
                Home
              </NavLink>

              {mode === 'rider' && (
                <>
                  <NavLink to="/search" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    Search Rides
                  </NavLink>
                  <NavLink to="/bookings" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    My Bookings
                  </NavLink>
                  <NavLink to="/dashboard/rider" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </NavLink>
                </>
              )}

              {mode === 'driver' && (
                <>
                  <NavLink to="/post-ride" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    Post Ride
                  </NavLink>
                  <NavLink to="/driver/trips" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    My Trips
                  </NavLink>
                  <NavLink to="/dashboard/driver" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </NavLink>
                </>
              )}

              <NavLink to="/wallet" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                Wallet
              </NavLink>
            </>
          )}
        </div>

        {/* Right side: auth buttons or user menu */}
        <div className={styles.authButtons}>
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
              <div
                className={styles.userAvatar}
                title={user?.name}
              >
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <>
              <NavLink to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </NavLink>
              <NavLink to="/register">
                <Button variant="primary" size="sm">
                  Sign up
                </Button>
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {isAuthenticated && (
            <div className={styles.modeToggle}>
              {['rider', 'driver'].map((m) => (
                <button
                  key={m}
                  className={[styles.modeBtn, mode === m ? styles.modeBtnActive : '']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    setMode(m);
                    setMobileOpen(false);
                  }}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          )}

          {isAuthenticated ? (
            <>
              <NavLink to="/" className={styles.navLink} onClick={() => setMobileOpen(false)} end>
                Home
              </NavLink>
              {mode === 'rider' && (
                <>
                  <NavLink to="/search" className={styles.navLink} onClick={() => setMobileOpen(false)}>
                    Search Rides
                  </NavLink>
                  <NavLink to="/bookings" className={styles.navLink} onClick={() => setMobileOpen(false)}>
                    My Bookings
                  </NavLink>
                  <NavLink to="/dashboard/rider" className={styles.navLink} onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </NavLink>
                </>
              )}
              {mode === 'driver' && (
                <>
                  <NavLink to="/post-ride" className={styles.navLink} onClick={() => setMobileOpen(false)}>
                    Post Ride
                  </NavLink>
                  <NavLink to="/driver/trips" className={styles.navLink} onClick={() => setMobileOpen(false)}>
                    My Trips
                  </NavLink>
                  <NavLink to="/dashboard/driver" className={styles.navLink} onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </NavLink>
                </>
              )}
              <NavLink to="/wallet" className={styles.navLink} onClick={() => setMobileOpen(false)}>
                Wallet
              </NavLink>
              <NavLink to="/profile" className={styles.navLink} onClick={() => setMobileOpen(false)}>
                Profile
              </NavLink>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" fullWidth>
                  Log in
                </Button>
              </NavLink>
              <NavLink to="/register" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" fullWidth>
                  Sign up
                </Button>
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
