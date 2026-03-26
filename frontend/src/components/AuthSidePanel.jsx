import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
    {
        id: 1,
        image: "/images/auth/cultivating.jpg",
        title: "Cultivating Intelligence",
        subtitle: "Securing Ecosystems",
        description: "Advanced AI monitoring for sustainable and high-yield farming ecosystems."
    },
    {
        id: 2,
        image: "/images/auth/precision.jpg",
        title: "Precision Analytics",
        subtitle: "Future of Farming",
        description: "Real-time data visualization and predictive modeling for your soil and crops."
    },
    {
        id: 3,
        image: "/images/auth/sustainable.jpg",
        title: "Sustainable Growth",
        subtitle: "Global Impact",
        description: "Empowering farmers worldwide with tools to reduce waste and maximize output."
    }
];

export default function AuthSidePanel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 6000); // 6 seconds for a slower, more premium pace
        return () => clearInterval(timer);
    }, []);

    const slide = slides[currentIndex];

    return (
        <div className="auth-image-panel">
            {/* Background Layer with Cross-fade and Ken Burns Effect */}
            <div className="auth-slides-wrapper" style={{ position: 'absolute', inset: 0 }}>
                <AnimatePresence initial={false}>
                    <motion.div
                        key={slide.id}
                        className="auth-slide-container"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        style={{ position: 'absolute', inset: 0 }}
                    >
                        <motion.img
                            src={slide.image}
                            alt={slide.title}
                            className="auth-image-bg"
                            initial={{ scale: 1 }}
                            animate={{ scale: 1.15 }}
                            transition={{ duration: 8, ease: "linear" }}
                        />
                        <div className="auth-image-overlay" />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="auth-image-header">
                <div className="auth-logo-text">AGRINOVA</div>
                <Link to="/" className="auth-back-btn">
                    Back to website 
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </Link>
            </div>

            <div className="auth-image-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slide.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <motion.h2 
                            className="auth-slide-title"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                        >
                            {slide.title}<br />
                            <span className="auth-slide-subtitle">{slide.subtitle}</span>
                        </motion.h2>
                        <motion.p 
                            className="auth-slide-description"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.4 }}
                        >
                            {slide.description}
                        </motion.p>
                    </motion.div>
                </AnimatePresence>
                
                <div className="auth-image-indicators">
                    {slides.map((_, idx) => (
                        <span 
                            key={idx} 
                            className={`auth-indicator ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(idx)}
                        ></span>
                    ))}
                </div>
            </div>
        </div>
    );
}
