import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Navbar.css';

const navLinksAuth = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/detect', label: 'Disease Detection' },
    { path: '/recommend', label: 'Crop Intelligence' },
    { path: '/fertilizer', label: 'Nutrient Plans' },
];

const navLinksPublic = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Capabilities' },
    { path: '/about', label: 'Mission' },
    { path: '/crops', label: 'Crop Library' },
    { path: '/technology', label: 'Technology' },
];

const exploreLinks = [
    { path: '/history', label: 'History' },
    { path: '/features', label: 'Capabilities' },
    { path: '/about', label: 'Mission' },
    { path: '/crops', label: 'Crop Library' },
    { path: '/technology', label: 'Technology' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [exploreOpen, setExploreOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 60;
            setScrolled(isScrolled);
            document.body.setAttribute('data-scrolled', isScrolled.toString());
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setDropdownOpen(false);
        setExploreOpen(false);
        setMobileOpen(false);
    }, [location]);

    const handleLogout = async () => {
        await logout();
    };

    const linksToUse = user ? navLinksAuth : navLinksPublic;

    return (
        <motion.nav
            className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="navbar__inner">
                <Link to="/" className="navbar__logo">
                    <span className="navbar__logo-earth">Agri</span>
                    <span className="navbar__logo-scape">Nova</span>
                </Link>

                {/* Desktop Links (Center) */}
                <div className="navbar__links hide-mobile">
                    {linksToUse.map(link => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `navbar__link link-underline ${isActive ? 'navbar__link--active' : ''}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    {/* Explore Dropdown (Visible only when logged in) */}
                    {user && (
                        <div
                            className="navbar__link navbar__explore-trigger"
                            onMouseEnter={() => setExploreOpen(true)}
                            onMouseLeave={() => setExploreOpen(false)}
                        >
                            <span className="link-underline">Explore</span>
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`navbar__chevron ${exploreOpen ? 'navbar__chevron--open' : ''}`}>
                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <AnimatePresence>
                                {exploreOpen && (
                                    <motion.div
                                        className="navbar__explore-dropdown"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        {exploreLinks.map(link => (
                                            <Link key={link.path} to={link.path} className="navbar__explore-link">
                                                {link.label}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Actions (Right) */}
                <div className="navbar__actions">
                    <button 
                        className="navbar__theme-toggle" 
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={theme}
                                initial={{ y: 10, opacity: 0, rotate: -30 }}
                                animate={{ y: 0, opacity: 1, rotate: 0 }}
                                exit={{ y: -10, opacity: 0, rotate: 30 }}
                                transition={{ duration: 0.2 }}
                            >
                                {theme === 'light' ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="5" />
                                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </svg>
                                )}
                            </motion.span>
                        </AnimatePresence>
                    </button>

                    {user ? (
                        <div
                            className="navbar__avatar"
                            onMouseEnter={() => setDropdownOpen(true)}
                            onMouseLeave={() => setDropdownOpen(false)}
                        >
                            <button className="navbar__avatar-btn">
                                {user.profile_picture ? (
                                    <img src={user.profile_picture} alt={user.username} />
                                ) : (
                                    user.username?.[0]?.toUpperCase() || 'U'
                                )}
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        className="navbar__dropdown"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <div className="navbar__dropdown-header">
                                            <p className="navbar__dropdown-name">{user.username}</p>
                                            <p className="navbar__dropdown-email">{user.email}</p>
                                        </div>
                                        <div className="navbar__dropdown-divider" />
                                        <Link to="/profile" className="navbar__dropdown-link">Profile Settings</Link>
                                        {user.is_admin && (
                                            <Link to="/admin" className="navbar__dropdown-link">Admin Dashboard</Link>
                                        )}
                                        <div className="navbar__dropdown-divider" />
                                        <button className="navbar__dropdown-link" onClick={handleLogout} style={{ width: '100%', textAlign: 'left' }}>
                                            Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="navbar__auth-links">
                            <Link to="/login" className="navbar__link hide-mobile">Sign In</Link>
                            <Link to="/signup" className="navbar__btn">Get Started</Link>
                        </div>
                    )}

                    {/* Hamburger for Mobile Menu */}
                    <button
                        className={`navbar__hamburger hide-desktop ${mobileOpen ? 'navbar__hamburger--open' : ''}`}
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="navbar__mobile"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {linksToUse.map(link => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className="navbar__mobile-link"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </NavLink>
                        ))}

                        {user && (
                            <>
                                <div className="navbar__mobile-group-label">Explore Solutions</div>
                                {exploreLinks.map(link => (
                                    <NavLink
                                        key={link.path}
                                        to={link.path}
                                        className="navbar__mobile-link navbar__mobile-link--sub"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}
                            </>
                        )}
                        {user ? (
                            <>
                                <div className="navbar__mobile-divider" />
                                <Link to="/profile" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Profile Settings</Link>
                                {user.is_admin && (
                                    <Link to="/admin" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Admin Dashboard</Link>
                                )}
                                <button className="navbar__mobile-link" onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="navbar__mobile-divider" />
                                <Link to="/login" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
