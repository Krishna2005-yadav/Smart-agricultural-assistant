import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimation(options = {}) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const {
            y = 60,
            x = 0,
            opacity = 0,
            duration = 1,
            delay = 0,
            ease = 'power3.out',
            start = 'top 85%',
            toggleActions = 'play none none none',
            stagger = 0,
        } = options;

        const children = stagger ? el.children : [el];

        gsap.set(children, { y, x, opacity });

        gsap.to(children, {
            y: 0,
            x: 0,
            opacity: 1,
            duration,
            delay,
            ease,
            stagger,
            scrollTrigger: {
                trigger: el,
                start,
                toggleActions,
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach(t => {
                if (t.trigger === el) t.kill();
            });
        };
    }, []);

    return ref;
}
