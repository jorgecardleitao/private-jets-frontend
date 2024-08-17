import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const MouseTracker = ({ children, offset = { x: 0, y: 0 } }) => {
    const element = useRef<HTMLDivElement>({});

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (element.current) {
                const x = e.clientX + offset.x
                const y = e.clientY + offset.y
                element.current.style.transform = `translate(${x}px, ${y}px)`;
                element.current.style.visibility = 'visible';
            }
        }
        document.addEventListener('mousemove', handler);
        return () => document.removeEventListener('mousemove', handler);
    }, [offset.x, offset.y]);

    return createPortal(
        <div className={'mouse-tracker'} style={{ position: "fixed", "pointer-events": "none", top: "0", left: "0", visibility: 'hidden' }} ref={element}>
            {children}
        </div>
        , document.body);
};
