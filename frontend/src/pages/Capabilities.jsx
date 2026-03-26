import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
import GalleryGrid from '../components/GalleryGrid';
import { getAllCapabilities, getCategories } from '../data/capabilities';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './Capabilities.css';

const allCapabilities = getAllCapabilities();
const categories = getCategories();

export default function Capabilities() {
    const [activeCategory, setActiveCategory] = useState('all');
    const headerRef = useScrollAnimation({ y: 40, duration: 0.8 });

    const filtered = useMemo(() => {
        if (activeCategory === 'all') return allCapabilities;
        return allCapabilities.filter(d => d.category === activeCategory);
    }, [activeCategory]);

    return (
        <PageTransition>
            <Navbar />
            <section className="discover__hero section">
                <div className="container" ref={headerRef}>
                    <p className="eyebrow" style={{ textAlign: 'center' }}>Capabilities</p>
                    <h1 className="discover__title">Explore Our Technology</h1>
                    <p className="discover__subtitle">
                        Discover {allCapabilities.length} powerful AI-driven tools designed for modern agriculture.
                    </p>
                </div>
            </section>

            <section className="discover__content">
                <div className="container">
                    <FilterBar
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                    />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <GalleryGrid items={filtered} />
                        </motion.div>
                    </AnimatePresence>

                    {filtered.length === 0 && (
                        <div className="discover__empty">
                            <p>No capabilities found for this category.</p>
                        </div>
                    )}
                </div>
            </section>
        </PageTransition>
    );
}
