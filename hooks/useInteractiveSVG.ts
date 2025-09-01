import { useEffect, useRef, useState } from 'react';
import { SVG_CONFIG } from '@/config/svg';

export interface UseInteractiveSVGResult {
    svgRef: React.RefObject<HTMLObjectElement>;
    selectedLot: string | null;
    setSelectedLot: (lotId: string | null) => void;
}

export function useInteractiveSVG(): UseInteractiveSVGResult {
    const svgRef = useRef<HTMLObjectElement>(null);
    const [selectedLot, setSelectedLot] = useState<string | null>(null);
    const pathsRef = useRef<HTMLElement[]>([]);

    useEffect(() => {
        const handleSVGLoad = () => {
            const svgDoc = svgRef.current?.contentDocument;
            if (!svgDoc) return;

            const elementList = SVG_CONFIG.interactivePaths
                .map((id: string) => svgDoc.getElementById(id))
                .filter(Boolean) as HTMLElement[];

            pathsRef.current = elementList;

            elementList.forEach(path => {
                const lotId = path.id;

                path.style.transition = `fill ${SVG_CONFIG.transitionDuration} ${SVG_CONFIG.transitionEasing}`;
                path.style.cursor = 'pointer';

                const onMouseEnter = () => {
                    if (selectedLot !== lotId) {
                        path.style.fill = SVG_CONFIG.hoverColor;
                    }
                };

                const onMouseLeave = () => {
                    if (selectedLot !== lotId) {
                        path.style.fill = SVG_CONFIG.defaultColor;
                    }
                };

                const onClick = () => {
                    setSelectedLot(lotId);
                };

                path.addEventListener('mouseenter', onMouseEnter);
                path.addEventListener('mouseleave', onMouseLeave);
                path.addEventListener('click', onClick);

                (path as any).__listeners = { onMouseEnter, onMouseLeave, onClick };
            });
        };

        const objectElement = svgRef.current;
        if (objectElement) {
            objectElement.addEventListener('load', handleSVGLoad);
            if (objectElement.contentDocument) {
                handleSVGLoad();
            }
        }

        return () => {
            if (objectElement) {
                objectElement.removeEventListener('load', handleSVGLoad);
            }
            pathsRef.current.forEach(path => {
                const listeners = (path as any).__listeners as
                    | { onMouseEnter: () => void; onMouseLeave: () => void; onClick: () => void }
                    | undefined;
                if (listeners) {
                    path.removeEventListener('mouseenter', listeners.onMouseEnter);
                    path.removeEventListener('mouseleave', listeners.onMouseLeave);
                    path.removeEventListener('click', listeners.onClick);
                }
            });
            pathsRef.current = [];
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        pathsRef.current.forEach(p => {
            p.style.fill = p.id === selectedLot ? '#10B981' : SVG_CONFIG.defaultColor;
        });
    }, [selectedLot]);

    return { svgRef, selectedLot, setSelectedLot };
} 