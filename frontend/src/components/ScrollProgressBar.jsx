import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <motion.div
            className="scroll-progress gpu-accel"
            style={{
                scaleX,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'var(--color-forest, #4a6741)',
                transformOrigin: '0%',
                zIndex: 400, // var(--z-toast) usually high
                willChange: 'transform'
            }}
        />
    );
}
