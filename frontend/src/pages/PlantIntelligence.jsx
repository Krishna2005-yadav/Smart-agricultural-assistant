import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// lucide-react icons removed from here
import PageTransition from '../components/PageTransition';
import FilterBar from '../components/FilterBar';
import GalleryGrid from '../components/GalleryGrid';
import { getAllCrops } from '../data/crops';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import Navbar from '../components/Navbar';
import './PlantIntelligence.css';

const allCrops = getAllCrops();

const categories = [
    { id: 'all', label: 'All Crops' },
    { id: 'Kharif', label: 'Kharif Season' },
    { id: 'Rabi', label: 'Rabi Season' },
    { id: 'Zaid', label: 'Zaid Season' }
];

export default function PlantIntelligence() {
    const [activeCategory, setActiveCategory] = useState('all');
    const headerRef = useScrollAnimation({ y: 40, duration: 0.8 });
    const navigate = useNavigate();

    const filtered = useMemo(() => {
        if (activeCategory === 'all') return allCrops;
        return allCrops.filter(c => c.season === activeCategory);
    }, [activeCategory]);

    // Format crops for GalleryGrid
    const gridItems = useMemo(() => {
        return filtered.map(c => ({
            ...c,
            location: `${c.season} Crop • ${c.climate}`
        }));
    }, [filtered]);

    return (
        <div className="pi-page-root">
            <Navbar />
            <PageTransition>
                <section className="pi-hero section">
                    <div className="container" ref={headerRef}>
                        <p className="eyebrow" style={{ textAlign: 'center' }}>Crop Library</p>
                        <h1 className="pi-title">Explore Plant Intelligence</h1>
                        <p className="pi-subtitle">
                            Filter through {allCrops.length} extraordinary crops across different seasons and climates.
                        </p>
                    </div>
                </section>



                <section className="pi-content">
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
                                <GalleryGrid 
                                    items={gridItems} 
                                    onItemClick={(item) => navigate(`/crops/${item.id}`)}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {filtered.length === 0 && (
                            <div className="pi-empty">
                                <p>No crops found for this category.</p>
                            </div>
                        )}
                    </div>
                </section>
            </PageTransition>
        </div>
    );
}

