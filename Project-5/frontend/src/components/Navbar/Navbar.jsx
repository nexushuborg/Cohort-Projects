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

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarInner}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={closeMobile}>
          <span className={styles.logoIcon}>◆</span>
          <span className={styles.logoText}>Freebuff</span>
        </Link>

        {/* Desktop nav */}
        <div className={styles.navCenter}>
          {isAuthenticated && (
            <>
              {/* Mode switcher — Uber-style pill toggle */}
              <div className={styles.modeSwitcher}>
                <button
                  className={[styles.modeBtn, mode === 'rider' ? styles.modeBtnActive : '']
                    .filter(Boolean).join(' ')}
                  onClick={() => setMode('rider')}
                >
                  <span className={styles.modeIcon}>🚶</span>
                  Rider
                </button>
                <button
                  className={[styles.modeBtn, mode === 'driver' ? styles.modeBtnActive : '']
                    .filter(Boolean).join(' ')}
                  onClick={() => setMode('driver')}
                >
                  <span className={styles.modeIcon}>🚗</span>
                  Driver
                </button>
              </div>

              <div className={styles.navDivider} />

              {/* Navigation links */}
              <div className={styles.navLinks}>
                <NavLink to="/" className={navLinkClass} end onClick={closeMobile}>
                  Home
                </NavLink>

                {mode === 'rider' && (
                  <>
                    <NavLink to="/search" className={navLinkClass} onClick={closeMobile}>
                      Search
                    </NavLink>
                    <NavLink to="/bookings" className={navLinkClass} onClick={closeMobile}>
                      Bookings
                    </NavLink>
                    <NavLink to="/dashboard/rider" className={navLinkClass} onClick={closeMobile}>
                      Dashboard
                    </NavLink>
                  </>
                )}

                {mode === 'driver' && (
                  <>
                    <NavLink to="/post-ride" className={navLinkClass} onClick={closeMobile}>
                      Post Ride
                    </NavLink>
                    <NavLink to="/driver/trips" className={navLinkClass} onClick={closeMobile}>
                      My Trips
                    </NavLink>
                    <NavLink to="/dashboard/driver" className={navLinkClass} onClick={closeMobile}>
                      Dashboard
                    </NavLink>
                  </>
                )}

                <NavLink to="/wallet" className={navLinkClass} onClick={closeMobile}>
                  Wallet
                </NavLink>
              </div>
            </>
          )}
        </div>

        {/* Right side */}
        <div className={styles.navRight}>
          {isAuthenticated ? (
            <div className={styles.userSection}>
              <NavLink to="/profile" className={styles.avatarLink} title={user?.name}>
                <div className={styles.userAvatar}>
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              </NavLink>
              <Button variant="ghost" size="xs" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          ) : (
            <div className={styles.authBtns}>
              <NavLink to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </NavLink>
              <NavLink to="/register">
                <Button variant="primary" size="sm">Sign up</Button>
              </NavLink>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={[styles.hamburgerLine, mobileOpen ? styles.open : ''].filter(Boolean).join(' ')} />
            <span className={[styles.hamburgerLine, mobileOpen ? styles.open : ''].filter(Boolean).join(' ')} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={closeMobile}>
          <div className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            {/* Mobile mode switcher */}
            <div className={styles.mobileModeToggle}>
              {['rider', 'driver'].map((m) => (
                <button
                  key={m}
                  className={[styles.mobileModeBtn, mode === m ? styles.mobileModeBtnActive : '']
                    .filter(Boolean).join(' ')}
                  onClick={() => { setMode(m); closeMobile(); }}
                >
                  {m === 'rider' ? '🚶' : '🚗'} {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            {/* Mobile nav links */}
            <div className={styles.mobileNavLinks}>
              <NavLink to="/" className={styles.mobileNavLink} onClick={closeMobile} end>
                Home
              </NavLink>
              {mode === 'rider' && (
                <>
                  <NavLink to="/search" className={styles.mobileNavLink} onClick={closeMobile}>
                    Search Rides
                  </NavLink>
                  <NavLink to="/bookings" className={styles.mobileNavLink} onClick={closeMobile}>
                    My Bookings
                  </NavLink>
                  <NavLink to="/dashboard/rider" className={styles.mobileNavLink} onClick={closeMobile}>
                    Dashboard
                  </NavLink>
                </>
              )}
              {mode === 'driver' && (
                <>
                  <NavLink to="/post-ride" className={styles.mobileNavLink} onClick={closeMobile}>
                    Post Ride
                  </NavLink>
                  <NavLink to="/driver/trips" className={styles.mobileNavLink} onClick={closeMobile}>
                    My Trips
                  </NavLink>
                  <NavLink to="/dashboard/driver" className={styles.mobileNavLink} onClick={closeMobile}>
                    Dashboard
                  </NavLink>
                </>
              )}
              <NavLink to="/wallet" className={styles.mobileNavLink} onClick={closeMobile}>
                Wallet
              </NavLink>
              <NavLink to="/profile" className={styles.mobileNavLink} onClick={closeMobile}>
                Profile
              </NavLink>
            </div>

            <div className={styles.mobileFooter}>
              {isAuthenticated ? (
                <Button variant="ghost" fullWidth onClick={handleLogout}>
                  Log out
                </Button>
              ) : (
                <>
                  <NavLink to="/login" onClick={closeMobile}>
                    <Button variant="secondary" fullWidth>Log in</Button>
                  </NavLink>
                  <NavLink to="/register" onClick={closeMobile}>
                    <Button variant="primary" fullWidth>Sign up</Button>
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
