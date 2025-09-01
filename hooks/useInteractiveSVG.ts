import { useEffect, useMemo, useRef, useState } from 'react';
import { SVG_CONFIG } from '@/config/svg';
import { useLotesEtapa1 } from '@/hooks/useLotes';

export interface UseInteractiveSVGResult {
    svgRef: React.RefObject<HTMLObjectElement>;
    selectedLot: string | null;
    setSelectedLot: (lotId: string | null) => void;
}

export function useInteractiveSVG(): UseInteractiveSVGResult {
    const svgRef = useRef<HTMLObjectElement>(null);
    const [selectedLot, setSelectedLot] = useState<string | null>(null);
    const pathsRef = useRef<HTMLElement[]>([]);

    const { data: lotes } = useLotesEtapa1();

    const interactiveIds = useMemo(() => {
        if (!lotes) return [] as string[];
        return lotes.map(l => String(l.id));
    }, [lotes]);

    useEffect(() => {
        const attachListeners = () => {
            const svgDoc = svgRef.current?.contentDocument;
            if (!svgDoc) return;

            // Asegurar filtros para borde interno por estado
            const ensureInnerStrokeFilters = () => {
                const svgRoot = svgDoc.querySelector('svg');
                if (!svgRoot) return;
                let defs = svgDoc.getElementById('interactive-defs') as SVGDefsElement | null;
                if (!defs) {
                    defs = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'defs') as SVGDefsElement;
                    defs.setAttribute('id', 'interactive-defs');
                    svgRoot.insertBefore(defs, svgRoot.firstChild);
                }

                const createFilter = (id: string, color: string, radiusPx: number) => {
                    if (svgDoc.getElementById(id)) return;
                    const filter = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'filter');
                    filter.setAttribute('id', id);
                    filter.setAttribute('filterUnits', 'objectBoundingBox');
                    filter.setAttribute('primitiveUnits', 'userSpaceOnUse');
                    filter.setAttribute('x', '0');
                    filter.setAttribute('y', '0');
                    filter.setAttribute('width', '1');
                    filter.setAttribute('height', '1');

                    const erode = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feMorphology');
                    erode.setAttribute('in', 'SourceAlpha');
                    erode.setAttribute('operator', 'erode');
                    erode.setAttribute('radius', String(radiusPx));
                    erode.setAttribute('result', 'eroded');
                    filter.appendChild(erode);

                    const innerBorder = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
                    innerBorder.setAttribute('in', 'SourceAlpha');
                    innerBorder.setAttribute('in2', 'eroded');
                    innerBorder.setAttribute('operator', 'out');
                    innerBorder.setAttribute('result', 'innerBorder');
                    filter.appendChild(innerBorder);

                    const flood = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
                    flood.setAttribute('flood-color', color);
                    flood.setAttribute('result', 'borderColor');
                    filter.appendChild(flood);

                    const colorize = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
                    colorize.setAttribute('in', 'borderColor');
                    colorize.setAttribute('in2', 'innerBorder');
                    colorize.setAttribute('operator', 'in');
                    colorize.setAttribute('result', 'coloredBorder');
                    filter.appendChild(colorize);

                    const merge = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
                    const mn1 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                    mn1.setAttribute('in', 'SourceGraphic');
                    const mn2 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                    mn2.setAttribute('in', 'coloredBorder');
                    merge.appendChild(mn1);
                    merge.appendChild(mn2);
                    filter.appendChild(merge);

                    defs!.appendChild(filter);
                };

                const innerRadius = Number(SVG_CONFIG.strokeWidth || '1');
                createFilter('inner-stroke-guardado', SVG_CONFIG.stateStrokeColorByStatus['guardado'], innerRadius);
                createFilter('inner-stroke-reservado', SVG_CONFIG.stateStrokeColorByStatus['reservado'], innerRadius);
                createFilter('inner-stroke-vendido', SVG_CONFIG.stateStrokeColorByStatus['vendido'], innerRadius);
            };

            ensureInnerStrokeFilters();

            // Normalizar atributos del SVG embebido para mantener proporción y centrado
            const svgRoot = svgDoc.querySelector('svg');
            if (svgRoot) {
                svgRoot.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                svgRoot.removeAttribute('width');
                svgRoot.removeAttribute('height');
                svgRoot.setAttribute('width', '100%');
                svgRoot.setAttribute('height', '100%');
                svgRoot.setAttribute('overflow', 'hidden');
                const bgImage = svgRoot.querySelector('image');
                if (bgImage) {
                    bgImage.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                }
            }

            // Limpiar listeners anteriores si los hubiera
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

            const idsToUse = interactiveIds.length ? interactiveIds : SVG_CONFIG.interactivePaths;

            const elementList = idsToUse
                .map((id: string) => svgDoc.getElementById(id))
                .filter(Boolean) as HTMLElement[];

            pathsRef.current = elementList;

            elementList.forEach(path => {
                const lotId = path.id;
                const lotData = lotes?.find(l => String(l.id) === lotId);
                const baseColor = lotData
                    ? (SVG_CONFIG.stateColorByStatus[`${lotData.estado}`] ?? SVG_CONFIG.defaultColor)
                    : 'none';
                const baseStroke = lotData ? (SVG_CONFIG.stateStrokeColorByStatus[`${lotData.estado}`] ?? 'transparent') : 'transparent';

                path.style.transition = `fill ${SVG_CONFIG.transitionDuration} ${SVG_CONFIG.transitionEasing}`;
                path.style.cursor = 'pointer';
                path.style.pointerEvents = 'all';
                path.style.fill = baseColor;
                // Usamos filtro para borde interno; quitamos stroke para evitar doble borde
                path.style.stroke = 'transparent';
                path.style.strokeWidth = '0';
                if (lotData && lotData.estado !== 'libre') {
                    const filterId = `inner-stroke-${lotData.estado}`;
                    path.setAttribute('filter', `url(#${filterId})`);
                } else {
                    path.removeAttribute('filter');
                }

                const onMouseEnter = () => {
                    if (selectedLot !== lotId) {
                        path.style.fill = SVG_CONFIG.hoverColor;
                        // Mantiene filtro de borde interno
                    }
                };

                const onMouseLeave = () => {
                    if (selectedLot !== lotId) {
                        const currentLot = lotes?.find(l => String(l.id) === lotId);
                        const currentColor = currentLot
                            ? (currentLot.estado === 'libre'
                                ? 'none'
                                : (SVG_CONFIG.stateColorByStatus[`${currentLot.estado}`] ?? SVG_CONFIG.defaultColor))
                            : 'none';
                        path.style.fill = currentColor;
                        if (currentLot && currentLot.estado !== 'libre') {
                            const filterId = `inner-stroke-${currentLot.estado}`;
                            path.setAttribute('filter', `url(#${filterId})`);
                        } else {
                            path.removeAttribute('filter');
                        }
                    }
                };

                const onClick = () => {
                    setSelectedLot(lotId);
                    // El color fill de selección se gestiona en el efecto de selectedLot
                };

                path.addEventListener('mouseenter', onMouseEnter);
                path.addEventListener('mouseleave', onMouseLeave);
                path.addEventListener('click', onClick);

                (path as any).__listeners = { onMouseEnter, onMouseLeave, onClick };
            });
        };

        const objectElement = svgRef.current;
        if (objectElement) {
            const onLoad = () => attachListeners();
            objectElement.addEventListener('load', onLoad);
            if (objectElement.contentDocument) {
                attachListeners();
            }
            return () => {
                objectElement.removeEventListener('load', onLoad);
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
        }
        return;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interactiveIds, lotes]);

    useEffect(() => {
        pathsRef.current.forEach(p => {
            const lotData = lotes?.find(l => String(l.id) === p.id);
            if (p.id === selectedLot) {
                p.style.fill = SVG_CONFIG.selectedColor;
            } else {
                const baseColor = lotData
                    ? (lotData.estado === 'libre'
                        ? 'none'
                        : (SVG_CONFIG.stateColorByStatus[`${lotData.estado}`] ?? SVG_CONFIG.defaultColor))
                    : 'none';
                p.style.fill = baseColor;
            }

            // Aplicar/actualizar filtro de borde interno
            if (lotData && lotData.estado !== 'libre') {
                const filterId = `inner-stroke-${lotData.estado}`;
                p.setAttribute('filter', `url(#${filterId})`);
            } else {
                p.removeAttribute('filter');
            }
        });
    }, [selectedLot, lotes]);

    return { svgRef, selectedLot, setSelectedLot };
}