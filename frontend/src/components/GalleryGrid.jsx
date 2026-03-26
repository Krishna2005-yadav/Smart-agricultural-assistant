import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GalleryGrid.css';

export default function GalleryGrid({ items, onItemClick }) {
    const [selectedItem, setSelectedItem] = useState(null);

    return (
        <>
            <div className="gallery-grid">
                {items.map((item, index) => (
                    <motion.div
                        key={item.name + index}
                        className="gallery-grid__item"
                        layout
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        onClick={() => {
                            if (onItemClick) {
                                onItemClick(item);
                            } else {
                                setSelectedItem(item);
                            }
                        }}
                    >
                        <div className="gallery-grid__image-wrap">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="gallery-grid__image"
                                loading="lazy"
                                decoding="async"
                            />
                            <div className="gallery-grid__overlay">
                                <h4 className="gallery-grid__name">{item.name}</h4>
                                <p className="gallery-grid__location">{item.location || item.continent}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Expanded Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        className="gallery-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            className="gallery-modal__content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                className="gallery-modal__close"
                                onClick={() => setSelectedItem(null)}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                            <div className="gallery-modal__image-wrap">
                                <img
                                    src={selectedItem.image}
                                    alt={selectedItem.name}
                                    className="gallery-modal__image"
                                />
                            </div>
                            <div className="gallery-modal__info">
                                <p className="eyebrow">{selectedItem.location || selectedItem.continent}</p>
                                <h3>{selectedItem.name}</h3>
                                <p>{selectedItem.description}</p>
                                {selectedItem.facts && (
                                    <div className="gallery-modal__facts">
                                        {selectedItem.facts.map((f, i) => (
                                            <span key={i} className="gallery-modal__fact-tag">{f}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
