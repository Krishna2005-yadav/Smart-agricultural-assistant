import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import './DashboardLayout.css';

export default function DashboardLayout({ children }) {
    const location = useLocation();

    const path = location.pathname.toLowerCase();
    const fullWidthRoutes = ['/dashboard', '/profile', '/recommend', '/detect', '/fertilizer'];
    const isFullContent = fullWidthRoutes.some(r => path.includes(r));
    const isStrictHeight = ['/detect', '/fertilizer'].some(r => path.includes(r));

    return (
        <div className="dashboard-layout">
            <Navbar />
            <main className={`dashboard-main ${isFullContent ? 'full-main' : ''}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className={`${isFullContent ? 'dashboard-full-content' : 'dashboard-main-content'} ${isStrictHeight ? 'detect-strict' : ''}`}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
