import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';

let lenisInstance = null;

export function initLenis() {
    if (lenisInstance) return lenisInstance;

    lenisInstance = new Lenis({
        duration: 0.9,
        lerp: 0.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
        syncTouch: true,
        autoResize: true,
    });

    // Sync Lenis with GSAP's ticker for consistent timing across all refresh rates
    gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return lenisInstance;
}

export function useLenis(callback) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        const lenis = initLenis();

        if (callbackRef.current) {
            lenis.on('scroll', callbackRef.current);
        }

        return () => {
            if (callbackRef.current) {
                lenis.off('scroll', callbackRef.current);
            }
        };
    }, []);

    return lenisInstance;
}

export function scrollTo(target, options = {}) {
    if (lenisInstance) {
        lenisInstance.scrollTo(target, options);
    }
}

export default useLenis;
