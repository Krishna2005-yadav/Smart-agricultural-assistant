import { motion } from 'framer-motion';
import './FilterBar.css';

export default function FilterBar({ categories, activeCategory, onCategoryChange }) {
    return (
        <div className="filter-bar">
            <div className="filter-bar__inner">
                {categories.map(cat => (
                    <motion.button
                        key={cat.id}
                        className={`filter-bar__btn ${activeCategory === cat.id ? 'filter-bar__btn--active' : ''}`}
                        onClick={() => onCategoryChange(cat.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {cat.label}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
