import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './FeatureCard.css';

gsap.registerPlugin(ScrollTrigger);

export default function FeatureCard({ feature, index = 0 }) {
    const cardRef = useRef(null);
    const imageRevealRef = useRef(null);

    useEffect(() => {
        const el = cardRef.current;
        if (!el) return;
        gsap.set(el, { y: 80, opacity: 0 });
        gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            delay: index * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
        });
        return () => ScrollTrigger.getAll().forEach((t) => { if (t.trigger === el) t.kill(); });
    }, [index]);

    useEffect(() => {
        const el = imageRevealRef.current;
        if (!el) return;
        gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' });
        gsap.to(el, {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.2,
            ease: 'power4.inOut',
            scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
        });
        return () => ScrollTrigger.getAll().forEach((t) => { if (t.trigger === el) t.kill(); });
    }, []);

    return (
        <motion.article
            ref={cardRef}
            className="feature-card"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
        >
            <div className="feature-card__image-wrap" ref={imageRevealRef}>
                <img
                    src={feature.image}
                    alt={feature.title}
                    className="feature-card__image"
                    loading="lazy"
                    decoding="async"
                />
                <div className="feature-card__image-overlay">
                    <span className="feature-card__category">{feature.category}</span>
                </div>
            </div>

            <div className="feature-card__body">
                <div className="feature-card__location eyebrow">{feature.eyebrow}</div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__description">{feature.description}</p>

                <div className="feature-card__facts">
                    {feature.facts.map((fact, i) => (
                        <span key={i} className="feature-card__fact">
                            {fact}
                        </span>
                    ))}
                </div>
            </div>
        </motion.article>
    );
}
