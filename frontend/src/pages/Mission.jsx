import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Navbar from '../components/Navbar';
import BlogLayout from '../components/BlogLayout';
import ScrollProgressBar from '../components/ScrollProgressBar';
import missions from '../data/missions';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './Mission.css';

export default function Mission() {
    const { id } = useParams();

    // If viewing a specific mission story
    if (id) {
        const story = missions.find(s => s.id === id);
        if (!story) {
            return (
                <PageTransition>
                    <div className="container section" style={{ textAlign: 'center', paddingTop: '10rem' }}>
                        <h2>Story not found</h2>
                    </div>
                </PageTransition>
            );
        }

        return (
            <PageTransition>
                <ScrollProgressBar />
                <Navbar />
                <BlogLayout story={story} />
                <div className="stories__back container">
                    <Link to="/about" className="stories__back-link link-underline">
                        ← Back to all stories
                    </Link>
                </div>
            </PageTransition>
        );
    }

    // Mission listing page
    const headerRef = useScrollAnimation({ y: 40, duration: 0.8 });

    return (
        <PageTransition>
            <Navbar />
            <section className="stories__hero section">
                <div className="container" ref={headerRef}>
                    <p className="eyebrow" style={{ textAlign: 'center' }}>Our Mission</p>
                    <h1 className="stories__title">Stories from the Field</h1>
                    <p className="stories__subtitle">
                        Exploring the intersection of agriculture and artificial intelligence.
                    </p>
                </div>
            </section>

            <section className="stories__list">
                <div className="container">
                    {missions.map((story, index) => (
                        <motion.div
                            key={story.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: index * 0.15 }}
                        >
                            <Link to={`/about/${story.id}`} className="stories__card">
                                <div className="stories__card-image-wrap">
                                    <img src={story.coverImage} alt={story.title} className="stories__card-image" loading="lazy" />
                                </div>
                                <div className="stories__card-body">
                                    <span className="eyebrow">{story.category}</span>
                                    <h2 className="stories__card-title">{story.title}</h2>
                                    <p className="stories__card-subtitle">{story.subtitle}</p>
                                    <div className="stories__card-meta">
                                        <span>{story.date}</span>
                                        <span className="stories__card-dot">·</span>
                                        <span>{story.readTime}</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>
        </PageTransition>
    );
}
