import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import FeatureCard from '../components/FeatureCard';
import api from '../api/axios';
import './Landing.css';

/* ─── Data Arrays ─── */
const agriculturalZones = [
    { slug: 'orchards', name: 'Precision Orchards', tagline: 'Data-Driven Fruit & Vineyards', heroImage: '/images/hero-bg.jpg' },
    { slug: 'greenhouses', name: 'Controlled Greenhouses', tagline: 'Climate-Optimized Hydroponics', heroImage: '/images/controlled-greenhouses.jpg' },
    { slug: 'arable', name: 'Arable Farmlands', tagline: 'Broadacre Cereal & Grain Tracking', heroImage: '/images/arable-farmlands.jpg' },
    { slug: 'terrace', name: 'Terrace Farming', tagline: 'Topographical Water Management', heroImage: '/images/intro-img.jpg' },
    { slug: 'agroforestry', name: 'Agroforestry', tagline: 'Sustainable Canopy Systems', heroImage: '/images/hero-bg.jpg' },
    { slug: 'vertical', name: 'Vertical Farms', tagline: 'Urban High-Density Growth', heroImage: '/images/cta-bg.jpg' },
    { slug: 'pastures', name: 'Pastures', tagline: 'Regenerative Livestock Management', heroImage: '/images/pastures.jpg' },
];

const featuredPractices = [
    {
        title: 'Intelligent Irrigation',
        eyebrow: 'Water Management',
        category: 'RESOURCE',
        description: 'Leveraging real-time soil moisture sensors and historical weather data, our irrigation networks predict exact water requirements. This reduces water waste by up to 40% while preventing crop water stress.',
        image: '/images/intelligent-irrigation.jpg',
        facts: ['40% Water Saved', 'Sensory Driven', 'Drought Resistant']
    },
    {
        title: 'Multispectral Drone Surveillance',
        eyebrow: 'Crop Monitoring',
        category: 'AERIAL AI',
        description: 'Autonomous drone fleets capture thermal and multispectral imagery to detect pest infestations, nutrient deficiencies, and water stress up to two weeks before they are visible to the naked eye.',
        image: '/images/intro-img.jpg', /* fallback */
        facts: ['Centimeter Precision', 'Early Detection', 'Thermal Imaging']
    },
    {
        title: 'Automated Soil Restoration',
        eyebrow: 'Soil Health',
        category: 'BIOME',
        description: 'Our proprietary models map soil microbiome health, prescribing exact cover crops and microbial inoculants to restore organic matter without synthetic dependency.',
        image: '/images/soil-restoration.jpg',
        facts: ['Microbial Boost', 'Carbon Sequestration', 'Regenerative']
    }
];

gsap.registerPlugin(ScrollTrigger);

/* ─── scroll-triggered reveal hook (inline from JourneyScape) ─── */
function useScrollReveal(opts = {}) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const { y = 60, duration = 1, start = 'top 85%' } = opts;
        gsap.set(el, { y, opacity: 0 });
        gsap.to(el, {
            y: 0, opacity: 1, duration, ease: 'power3.out',
            scrollTrigger: { trigger: el, start, toggleActions: 'play none none none' },
        });
        return () => ScrollTrigger.getAll().forEach(t => { if (t.trigger === el) t.kill(); });
    }, []);
    return ref;
}

/* ─── count-up hook ─── */
function useCountUp(target, duration = 2) {
    const ref = useRef(null);
    const countRef = useRef({ val: 0 });
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        gsap.to(countRef.current, {
            val: target, duration, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
            onUpdate: () => { if (el) el.textContent = Math.round(countRef.current.val).toLocaleString(); },
        });
        return () => ScrollTrigger.getAll().forEach(t => { if (t.trigger === el) t.kill(); });
    }, [target, duration]);
    return ref;
}

/* ─── StatCounter component ─── */
function StatCounter({ value, suffix = '', prefix = '', label }) {
    const numRef = useCountUp(value);
    return (
        <div className="stat-counter">
            <div className="stat-counter__value">
                {prefix && <span className="stat-counter__prefix">{prefix}</span>}
                <span ref={numRef}>0</span>
                {suffix && <span className="stat-counter__suffix">{suffix}</span>}
            </div>
            <div className="stat-counter__label">{label}</div>
        </div>
    );
}

export default function Landing() {
    const { user } = useAuth();
    const heroRef = useRef(null);
    const imageRef = useRef(null);
    const contentRef = useRef(null);
    const bgTransitionRef = useRef(null);
    const introRef = useScrollReveal({ y: 50, duration: 0.9 });
    const featuresRef = useScrollReveal({ y: 40, duration: 0.8 });
    const zonesRef = useScrollReveal({ y: 40, duration: 0.8 });
    const practicesRef = useScrollReveal({ y: 60, duration: 1.0 });

    const [stats, setStats] = useState({
        users: 0,
        scans: 0,
        recommendations: 0,
        fertilizer_plans: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/api/public/stats');
                if (data && !data.error) {
                    setStats({
                        users: data.users || 0,
                        scans: data.scans || 0,
                        recommendations: data.recommendations || 0,
                        fertilizer_plans: data.fertilizer_plans || 0
                    });
                }
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            }
        };
        fetchStats();
    }, []);

    /* GSAP hero parallax + content fade */
    useEffect(() => {
        const hero = heroRef.current;
        const img = imageRef.current;
        const content = contentRef.current;
        if (!hero || !img) return;

        if (window.innerWidth > 768) {
            gsap.to(img, {
                yPercent: 20, ease: 'none',
                scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
            });
        }
        if (content) {
            gsap.to(content, {
                opacity: 0, y: -60, ease: 'power2.in',
                scrollTrigger: { trigger: hero, start: 'top top', end: '40% top', scrub: true },
            });
        }
        return () => ScrollTrigger.getAll().forEach(t => { if (t.trigger === hero) t.kill(); });
    }, []);

    /* Stats bg-color transition */
    useEffect(() => {
        const el = bgTransitionRef.current;
        if (!el) return;
        gsap.to(el, {
            backgroundColor: '#1a1814', color: '#f5f0eb',
            scrollTrigger: { trigger: el, start: 'top 60%', end: 'top 20%', scrub: true },
        });
        return () => ScrollTrigger.getAll().forEach(t => { if (t.trigger === el) t.kill(); });
    }, []);

    return (
        <div className="landing landing-page-active">
            {/* ═══════ Global Navbar ═══════ */}
            <Navbar />

            {/* ═══════ Hero — exact JourneyScape pattern ═══════ */}
            <section className="hero" ref={heroRef}>
                <div className="hero__image-wrap">
                    <img
                        ref={imageRef}
                        src="/images/hero-bg.jpg"
                        alt="Agricultural landscape"
                        className="hero__image"
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                    />
                    <div className="hero__overlay" />
                </div>

                <div className="hero__content" ref={contentRef}>
                    <motion.p
                        className="hero__eyebrow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        Precision Agriculture Intelligence
                    </motion.p>
                    <motion.h1
                        className="hero__title"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        The Earth Speaks.{'\n'}Learn to Listen.
                    </motion.h1>
                    <motion.p
                        className="hero__subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        Diagnose crop diseases, optimise nutrient plans, and grow smarter — powered by machine learning and soil science.
                    </motion.p>
                </div>

                <motion.div
                    className="hero__scroll-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                >
                    <span className="hero__scroll-text">Scroll to explore</span>
                    <div className="hero__scroll-line">
                        <div className="hero__scroll-dot" />
                    </div>
                </motion.div>
            </section>

            {/* ═══════ Introduction ═══════ */}
            <section className="section landing__intro">
                <div className="container" ref={introRef}>
                    <div className="landing__intro-grid">
                        <div className="landing__intro-text">
                            <p className="eyebrow">Our Mission</p>
                            <h2>Nature doesn't need guesswork. It needs intelligence.</h2>
                            <p>
                                AgriNova transforms how farmers interact with their crops and soil.
                                By combining computer vision, machine learning, and soil science,
                                we deliver actionable insights that help reduce crop loss,
                                optimise nutrient usage, and increase yields.
                            </p>
                        </div>
                        <div className="landing__intro-image">
                            <img
                                src="/images/intro-img.jpg"
                                alt="Lush agricultural landscape"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ Statistics — bg transitions dark ═══════ */}
            <section className="section landing__stats" ref={bgTransitionRef}>
                <div className="container">
                    <div className="landing__stats-grid">
                        <StatCounter value={stats.users} suffix="+" label="Active Users" />
                        <StatCounter value={stats.scans} suffix="+" label="Scans Processed" />
                        <StatCounter value={stats.recommendations} suffix="+" label="Recommendations" />
                        <StatCounter value={stats.fertilizer_plans} suffix="+" label="Fertilizer Plans" />
                    </div>
                </div>
            </section>

            {/* ═══════ Platform Capabilities ═══════ */}
            <section className="section landing__features">
                <div className="container" ref={featuresRef}>
                    <div className="landing__section-header">
                        <p className="eyebrow">Platform Capabilities</p>
                        <h2>Three Pillars of Intelligence</h2>
                    </div>

                    <div className="landing__features-grid">
                        {[
                            {
                                icon: (
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M11 8v6M8 11h6" />
                                    </svg>
                                ),
                                title: 'Disease Detection',
                                desc: 'Upload a photo of any crop leaf. Our CNN model identifies 38 disease types across 14 species — returning confidence scores, symptoms, and treatment plans.',
                            },
                            {
                                icon: (
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                                    </svg>
                                ),
                                title: 'Crop Intelligence',
                                desc: 'Enter soil NPK levels, temperature, humidity, rainfall, and pH. Our model matches conditions against 22 crop profiles for optimal selection.',
                            },
                            {
                                icon: (
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7 7-7z" />
                                    </svg>
                                ),
                                title: 'Nutrient Planning',
                                desc: 'Compare current soil nutrients against ideal crop requirements. Get exact Urea, DAP, and MOP quantities for precision fertilisation.',
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="landing__feature-card card"
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: i * 0.12 }}
                            >
                                <div className="landing__feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ Agricultural Zones (Continents style) ═══════ */}
            <section className="section landing__zones">
                <div className="container" ref={zonesRef}>
                    <div className="landing__section-header">
                        <p className="eyebrow">Explore Agrosystems</p>
                        <h2>Global Ecosystems. Local Precision.</h2>
                    </div>

                    <div className="landing__zones-grid">
                        {agriculturalZones.map((zone, i) => (
                            <motion.div
                                key={zone.slug}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: i * 0.1 }}
                            >
                                <div className="landing__zone-card">
                                    <div className="landing__zone-image-wrap">
                                        <img
                                            src={zone.heroImage}
                                            alt={zone.name}
                                            className="landing__zone-image"
                                            loading="lazy"
                                        />
                                        <div className="landing__zone-overlay" />
                                    </div>
                                    <div className="landing__zone-info">
                                        <h3>{zone.name}</h3>
                                        <p>{zone.tagline}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ Featured Practices (Destinations style) ═══════ */}
            <section className="section landing__practices">
                <div className="container">
                    <div className="landing__section-header" ref={practicesRef}>
                        <p className="eyebrow">Advanced Practices</p>
                        <h2>Solutions That Redefine Growth</h2>
                    </div>

                    <div className="landing__featured-grid">
                        {featuredPractices.map((practice, i) => (
                            <FeatureCard key={practice.title} feature={practice} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ Closing CTA ═══════ */}
            <section className="landing__closing">
                <div className="landing__closing-bg">
                    <img src="/images/cta-bg.jpg" alt="Mountain landscape" loading="lazy" />
                    <div className="landing__closing-overlay" />
                </div>
                <div className="container landing__closing-content">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Start Growing Smarter</p>
                        <h2 style={{ color: '#fff' }}>Every Field Has a Story</h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
                            Join thousands of farmers using AgriNova to make data-driven decisions and maximise yields.
                        </p>
                        <Link to={user ? '/dashboard' : '/signup'} className="landing__closing-btn">
                            {user ? 'Go to Dashboard' : 'Create Free Account'}
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ═══════ Footer ═══════ */}
            <footer className="landing__footer">
                <div className="container">
                    <div className="landing__footer-brand">
                        <span>Agri</span><em>Nova</em>
                    </div>
                    <p>AI-powered agricultural intelligence platform.</p>
                    <p className="landing__footer-copy">© {new Date().getFullYear()} AgriNova. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
