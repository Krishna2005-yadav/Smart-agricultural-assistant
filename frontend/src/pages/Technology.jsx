import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Activity, TestTubes, ArrowRight, Brain, Network, Zap } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import FilterBar from '../components/FilterBar';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import Navbar from '../components/Navbar';
import './Technology.css';

const techCategories = [
    { id: 'all', label: 'All Deep Dives' },
    { id: 'disease', label: 'Disease Detection' },
    { id: 'nutrient', label: 'Nutrient Planning' },
    { id: 'intelligence', label: 'Crop Intelligence' }
];

export default function Technology() {
    const [activeCategory, setActiveCategory] = useState('all');
    const headerRef = useScrollAnimation({ y: 40, duration: 0.8 });
    const contentRef = useScrollAnimation({ y: 40, duration: 0.8 });

    return (
        <div className="pi-page-root">
            <Navbar />
            <PageTransition>
                <section className="pi-hero section">
                    <div className="container" ref={headerRef}>
                        <p className="eyebrow" style={{ textAlign: 'center' }}>Technology</p>
                        <h1 className="pi-title">The Science Behind AgriNova</h1>
                        <p className="pi-subtitle">
                            Explore the mathematics, AI models, and agricultural algorithms powering our predictive analytics.
                        </p>
                    </div>
                </section>

                <section className="pi-content" ref={contentRef}>
                    <div className="container" style={{ marginBottom: "3rem" }}>
                        <FilterBar
                            categories={techCategories}
                            activeCategory={activeCategory}
                            onCategoryChange={setActiveCategory}
                        />
                    </div>
                    
                    <div className="container pi-deep-dive" style={{ margin: "0 auto", paddingBottom: "5rem" }}>
                        <AnimatePresence mode="popLayout">
                            
                            {/* Disease Detection */}
                            {(activeCategory === 'all' || activeCategory === 'disease') && (
                                <motion.div 
                                    className="pi-deep-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    layout
                                >
                                    <div className="pi-deep-header">
                                        <Brain size={28} color="var(--color-forest)" />
                                        <h3>Convolutional Neural Networks (CNN) for Disease Detection</h3>
                                    </div>
                                    
                                    <div className="pi-step">
                                        <div className="pi-step-num">1</div>
                                        <div className="pi-step-content">
                                            <div className="pi-step-title">Input Matrix Transformation</div>
                                            <div className="pi-step-desc">
                                                An uploaded image of a crop leaf X (H × W × 3) is instantly captured and resized into a standardized 128 × 128 × 3 RGB tensor.
                                            </div>
                                            
                                            {/* Diagram: Matrix scaling */}
                                            <div className="tech-diagram matrix-diagram">
                                                <div className="diagram-box raw-img">Raw Leaf (Any Size)</div>
                                                <ArrowRight size={20} className="diagram-arrow" />
                                                <div className="diagram-box tensor-cube">
                                                    <span>Tensor X</span>
                                                    <small>128 x 128 x 3</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pi-step">
                                        <div className="pi-step-num">2</div>
                                        <div className="pi-step-content">
                                            <div className="pi-step-title">Feature Extraction (EfficientNetB0 Backbone)</div>
                                            <div className="pi-step-desc">
                                                Deep convolutional layers apply learned filters F to extract spatial hierarchies, separating background noise from actual leaf lesions. The internal operation maps to:
                                                <div className="pi-formula">Y = Activation(F * X + B)</div>
                                            </div>
                                            
                                            {/* Diagram: Neural Network Layers */}
                                            <div className="tech-diagram nn-diagram">
                                                <div className="nn-layer">X</div>
                                                <Network size={20} className="diagram-icon" />
                                                <div className="nn-layer hidden">Conv1</div>
                                                <Network size={20} className="diagram-icon" />
                                                <div className="nn-layer hidden">Conv2</div>
                                                <Network size={20} className="diagram-icon" />
                                                <div className="nn-layer">Y</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pi-step">
                                        <div className="pi-step-num">3</div>
                                        <div className="pi-step-content">
                                            <div className="pi-step-title">Softmax Classification</div>
                                            <div className="pi-step-desc">
                                                The final feature vector Z is passed through a softmax classifier to output a probability distribution across 22 trained disease classes:
                                                <div className="pi-formula">P(y=j | x) = e^z_j / Σ(e^z_k)</div>
                                            </div>
                                            
                                            {/* Diagram: Probabilities */}
                                            <div className="tech-diagram softmax-diagram">
                                                <div className="softmax-bar">
                                                    <div className="softmax-fill" style={{ width: "94%" }}></div>
                                                    <span className="softmax-text">Apple Scab (94%)</span>
                                                </div>
                                                <div className="softmax-bar">
                                                    <div className="softmax-fill" style={{ width: "4%" }}></div>
                                                    <span className="softmax-text">Apple Rust (4%)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Nutrient Planning */}
                            {(activeCategory === 'all' || activeCategory === 'nutrient') && (
                                <motion.div 
                                    className="pi-deep-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    layout
                                >
                                    <div className="pi-deep-header">
                                        <TestTubes size={28} color="var(--color-forest)" />
                                        <h3>Soil Science & Targeted Yield Nutrient Planning</h3>
                                    </div>
                                    
                                    <div className="pi-step">
                                        <div className="pi-step-num">1</div>
                                        <div className="pi-step-content">
                                            <div className="pi-step-title">Establishing the Baseline</div>
                                            <div className="pi-step-desc">
                                                Every agricultural crop possesses an optimal target yield (Y_target) and an inherent nutrient uptake ratio for Nitrogen (N), Phosphorus (P), and Potassium (K).
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pi-step">
                                        <div className="pi-step-num">2</div>
                                        <div className="pi-step-content">
                                            <div className="pi-step-title">Calculating the Soil Deficit</div>
                                            <div className="pi-step-desc">
                                                We determine the existing soil supply S(N,P,K). The total required fertilizer is a function of the nutrient deficit divided by the fertilizer efficiency E:
                                                <div className="pi-formula">F_req = ((Y_target × Uptake) - S) / E</div>
                                            </div>
                                            
                                            {/* Diagram: Formula Break Down */}
                                            <div className="tech-diagram formula-flow">
                                                <div className="box soil-box">Soil Supply (S)</div>
                                                <div className="operator">-</div>
                                                <div className="box target-box">Target Yield Reqs</div>
                                                <div className="operator">=</div>
                                                <div className="box deficit-box">Deficit / Efficiency</div>
                                                <ArrowRight size={20} className="diagram-arrow" />
                                                <div className="box final-npk">Final NPK Mix</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Crop Intelligence */}
                            {(activeCategory === 'all' || activeCategory === 'intelligence') && (
                                <motion.div 
                                    className="pi-deep-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    layout
                                >
                                    <div className="pi-deep-header">
                                        <Activity size={28} color="var(--color-forest)" />
                                        <h3>Multi-Dimensional Climatic Mapping</h3>
                                    </div>

                                    <div className="pi-step">
                                        <div className="pi-step-num">1</div>
                                        <div className="pi-step-content">
                                            <div className="pi-step-title">Crop Vector Binding</div>
                                            <div className="pi-step-desc">
                                                Crops are mapped conceptually as vectors in a multi-dimensional climate space:
                                                <div className="pi-formula">V_crop = [T_min, T_max, R_min, R_max, pH_min, pH_max]</div>
                                            </div>
                                            
                                            {/* Diagram: Vector bounds */}
                                            <div className="tech-diagram radar-diagram">
                                                <div className="radar-axis axis-temp">Temp (15°C - 28°C)</div>
                                                <div className="radar-axis axis-rain">Rain (1000 - 1500mm)</div>
                                                <div className="radar-axis axis-soil">Soil pH (6.0 - 7.5)</div>
                                                <div className="radar-center">
                                                    <Zap size={24} className="radar-pulse" />
                                                    Crop Vector Point
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pi-step">
                                        <div className="pi-step-num">2</div>
                                        <div className="pi-step-content">
                                            <div className="pi-step-title">Suitability Indexing</div>
                                            <div className="pi-step-desc">
                                                To guarantee successful germination and harvest, regional weather and soil data arrays must tightly intersect with the bounded constraints of the crop vector.
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </section>
            </PageTransition>
        </div>
    );
}
