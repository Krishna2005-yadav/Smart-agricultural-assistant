import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LoadingScreen.css';

export default function LoadingScreen() {
    const [progress, setProgress] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        const duration = 1800;
        const interval = 20;
        const step = 100 / (duration / interval);
        let current = 0;

        const timer = setInterval(() => {
            const eased = current < 60
                ? current + step * 1.5
                : current < 85
                    ? current + step * 0.5
                    : current + step * 2;

            current = Math.min(eased, 100);
            setProgress(Math.round(current));

            if (current >= 100) {
                clearInterval(timer);
                setTimeout(() => setIsExiting(true), 300);
            }
        }, interval);

        return () => clearInterval(timer);
    }, []);

    if (done) return null;

    return (
        <AnimatePresence onExitComplete={() => setDone(true)}>
            {!isExiting && (
                <motion.div
                    className="preloader"
                    exit={{ y: '-100%' }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                >
                    <motion.div
                        className="preloader__glow"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    <div className="preloader__logo">
                        <motion.span
                            className="preloader__logo-main"
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        >
                            Agri
                        </motion.span>
                        <motion.span
                            className="preloader__logo-accent"
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                        >
                            Nova
                        </motion.span>
                    </div>

                    <motion.p
                        className="preloader__tagline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        Agricultural Intelligence Platform
                    </motion.p>

                    <motion.div
                        className="preloader__line"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    />

                    <motion.div
                        className="preloader__progress"
                        style={{ width: `${progress}%` }}
                        transition={{ duration: 0.1, ease: 'linear' }}
                    />

                    <motion.div
                        className="preloader__counter"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {progress}%
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
