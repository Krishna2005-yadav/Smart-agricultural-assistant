import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HeroSection.css';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection({
    image,
    title,
    subtitle,
    eyebrow,
    overlay = true,
    height = '100vh',
    scrollIndicator = true,
    children,
}) {
    const heroRef = useRef(null);
    const imageRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        const hero = heroRef.current;
        const img = imageRef.current;
        const content = contentRef.current;
        if (!hero || !img) return;

        // Parallax on the image
        if (window.innerWidth > 768) {
            gsap.to(img, {
                yPercent: 20,
                ease: 'none',
                scrollTrigger: {
                    trigger: hero,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }

        // Fade out content on scroll
        if (content) {
            gsap.to(content, {
                opacity: 0,
                y: -60,
                ease: 'power2.in',
                scrollTrigger: {
                    trigger: hero,
                    start: 'top top',
                    end: '40% top',
                    scrub: true,
                },
            });
        }

        return () => {
            ScrollTrigger.getAll().forEach(t => {
                if (t.trigger === hero) t.kill();
            });
        };
    }, []);

    return (
        <section className="hero" ref={heroRef} style={{ height }}>
            <div className="hero__image-wrap">
                <img
                    ref={imageRef}
                    src={image}
                    alt={title}
                    className="hero__image"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                />
                {overlay && <div className="hero__overlay" />}
            </div>

            <div className="hero__content gpu-accel" ref={contentRef}>
                {eyebrow && (
                    <motion.p
                        className="hero__eyebrow eyebrow will-change-both"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        {eyebrow}
                    </motion.p>
                )}
                <motion.h1
                    className="hero__title will-change-both"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    {title}
                </motion.h1>
                {subtitle && (
                    <motion.p
                        className="hero__subtitle will-change-both"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        {subtitle}
                    </motion.p>
                )}
                {children && (
                    <motion.div
                        className="hero__actions will-change-transform"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}
                    >
                        {children}
                    </motion.div>
                )}
            </div>

            {scrollIndicator && (
                <motion.div
                    className="hero__scroll-indicator will-change-opacity gpu-accel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                >
                    <span className="hero__scroll-text">Scroll to explore</span>
                    <div className="hero__scroll-line">
                        <div className="hero__scroll-dot" />
                    </div>
                </motion.div>
            )}
        </section>
    );
}
