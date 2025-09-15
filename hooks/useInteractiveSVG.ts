import { useEffect, useMemo, useRef, useState } from 'react';
import { SVG_CONFIG } from '@/config/svg';
import { useLotesEtapa1 } from '@/hooks/useLotes';
import type { LoteAPIResponse } from '@/services/lotes';

export interface UseInteractiveSVGResult {
    svgRef: React.RefObject<HTMLObjectElement>;
    selectedLot: string | null;
    setSelectedLot: (lotId: string | null) => void;
    lotes: LoteAPIResponse[] | null;
    isSvgReady: boolean;
}

export function useInteractiveSVG(): UseInteractiveSVGResult {
    const svgRef = useRef<HTMLObjectElement>(null);
    const [selectedLot, setSelectedLot] = useState<string | null>(null);
    const pathsRef = useRef<HTMLElement[]>([]);
    const [isSvgReady, setIsSvgReady] = useState<boolean>(false);
    // Estado para pinch-zoom/pan en mobile (viewBox)
    const initialViewBoxRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
    const currentViewBoxRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
    const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
    const lastPinchDistanceRef = useRef<number | null>(null);
    const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);
    const gesturesEnabledRef = useRef<boolean>(true);

    const { data: lotes } = useLotesEtapa1();

    const interactiveIds = useMemo(() => {
        if (!lotes) return [] as string[];
        return lotes.map(l => String(l.id));
    }, [lotes]);

    useEffect(() => {
        let cleanupGestures: (() => void) | null = null;
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

                // Estilo base para prevenir flash negro: shapes transparentes por defecto
                if (!svgDoc.getElementById('interactive-base-style')) {
                    const style = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'style');
                    style.setAttribute('id', 'interactive-base-style');
                    style.textContent = `polygon, path, rect, circle, ellipse, polyline { fill: none; }`;
                    defs!.appendChild(style);
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
            const svgRoot = svgDoc.querySelector('svg') as SVGSVGElement | null;
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

                // Configurar viewBox inicial para zoom/pan en mobile
                const vb = svgRoot.getAttribute('viewBox');
                if (vb) {
                    const [vx, vy, vw, vh] = vb.split(/\s+/).map(Number);
                    if (!initialViewBoxRef.current) {
                        initialViewBoxRef.current = { x: vx, y: vy, w: vw, h: vh };
                    }
                    currentViewBoxRef.current = { x: vx, y: vy, w: vw, h: vh };
                }

                const isMobile = typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches ?? false);
                if (isMobile) {
                    // Evitar que el navegador capture el pinch (que lo capture el SVG)
                    (svgRoot.style as any).touchAction = 'none';

                    const toSvgPoint = (clientX: number, clientY: number) => {
                        const pt = svgRoot.createSVGPoint();
                        pt.x = clientX;
                        pt.y = clientY;
                        const ctm = svgRoot.getScreenCTM();
                        if (!ctm) return { x: clientX, y: clientY };
                        const sp = pt.matrixTransform(ctm.inverse());
                        return { x: sp.x, y: sp.y };
                    };

                    const applyViewBox = (vbObj: { x: number; y: number; w: number; h: number }) => {
                        currentViewBoxRef.current = vbObj;
                        svgRoot.setAttribute('viewBox', `${vbObj.x} ${vbObj.y} ${vbObj.w} ${vbObj.h}`);
                    };

                    const onPointerDown = (ev: PointerEvent) => {
                        if (!gesturesEnabledRef.current) return;
                        (ev.target as Element).setPointerCapture?.(ev.pointerId);
                        const p = toSvgPoint(ev.clientX, ev.clientY);
                        pointersRef.current.set(ev.pointerId, p);
                        if (pointersRef.current.size === 1) {
                            lastPanPointRef.current = p;
                        }
                    };

                    const onPointerMove = (ev: PointerEvent) => {
                        if (!gesturesEnabledRef.current) return;
                        if (!currentViewBoxRef.current) return;
                        if (!pointersRef.current.has(ev.pointerId)) return;
                        const p = toSvgPoint(ev.clientX, ev.clientY);
                        pointersRef.current.set(ev.pointerId, p);

                        const pts = Array.from(pointersRef.current.values());
                        if (pts.length === 2) {
                            // Pinch (zoom alrededor del centro de los dedos)
                            const [p1, p2] = pts;
                            const dx = p2.x - p1.x;
                            const dy = p2.y - p1.y;
                            const distance = Math.hypot(dx, dy);
                            const prevDistance = lastPinchDistanceRef.current ?? distance;
                            const vbCur = currentViewBoxRef.current;
                            const initial = initialViewBoxRef.current ?? vbCur;
                            if (!initial || !vbCur) return;
                            let scaleFactor = distance / (prevDistance || distance);
                            // Escala acumulada, clamp 1x..8x
                            const currentScale = initial.w / vbCur.w;
                            let targetScale = Math.max(1, Math.min(8, currentScale * scaleFactor));
                            const newW = initial.w / targetScale;
                            const newH = initial.h / targetScale;
                            const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
                            const newX = center.x - (center.x - vbCur.x) * (newW / vbCur.w);
                            const newY = center.y - (center.y - vbCur.y) * (newH / vbCur.h);
                            applyViewBox({ x: newX, y: newY, w: newW, h: newH });
                            lastPinchDistanceRef.current = distance;
                            lastPanPointRef.current = null;
                        } else if (pts.length === 1) {
                            // Pan
                            const vbCur = currentViewBoxRef.current;
                            const last = lastPanPointRef.current;
                            const cur = pts[0];
                            if (vbCur && last) {
                                const dx = cur.x - last.x;
                                const dy = cur.y - last.y;
                                applyViewBox({ x: vbCur.x - dx, y: vbCur.y - dy, w: vbCur.w, h: vbCur.h });
                            }
                            lastPanPointRef.current = cur;
                        }
                    };

                    const onPointerUpOrCancel = (ev: PointerEvent) => {
                        pointersRef.current.delete(ev.pointerId);
                        if (pointersRef.current.size < 2) {
                            lastPinchDistanceRef.current = null;
                        }
                        if (pointersRef.current.size === 0) {
                            lastPanPointRef.current = null;
                        }
                    };

                    svgRoot.addEventListener('pointerdown', onPointerDown);
                    svgRoot.addEventListener('pointermove', onPointerMove);
                    svgRoot.addEventListener('pointerup', onPointerUpOrCancel);
                    svgRoot.addEventListener('pointercancel', onPointerUpOrCancel);

                    cleanupGestures = () => {
                        svgRoot.removeEventListener('pointerdown', onPointerDown);
                        svgRoot.removeEventListener('pointermove', onPointerMove);
                        svgRoot.removeEventListener('pointerup', onPointerUpOrCancel);
                        svgRoot.removeEventListener('pointercancel', onPointerUpOrCancel);
                    };
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

                path.style.transition = `fill ${SVG_CONFIG.transitionDuration} ${SVG_CONFIG.transitionEasing}, opacity 300ms ease, transform 450ms ease, filter 400ms ease`;
                path.style.cursor = 'pointer';
                path.style.pointerEvents = 'all';
                path.style.fill = baseColor;
                // Usamos filtro para borde interno; quitamos stroke para evitar doble borde
                path.style.stroke = 'transparent';
                path.style.strokeWidth = '0';
                (path.style as any).transformOrigin = '50% 50%';
                if (lotData && lotData.estado !== 'libre') {
                    const filterId = `inner-stroke-${lotData.estado}`;
                    path.setAttribute('filter', `url(#${filterId})`);
                } else {
                    path.removeAttribute('filter');
                }

                // Preparar aparición inicial (solo 1 vez por lote). No disparamos aún, lo haremos escalonado abajo
                if (!(path as any).__appeared && !(path as any).__appearanceInitialized) {
                    path.style.opacity = '0';
                    path.style.transform = 'scale(0.985)';
                    path.style.filter = 'blur(0.6px)';
                    (path as any).__appearanceInitialized = true;
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
                    // En mobile: resetear zoom/pan a 1x antes de abrir modal
                    try {
                        const isMobile = typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches ?? false);
                        const svgRootEl = svgRef.current?.contentDocument?.querySelector('svg') as SVGSVGElement | null;
                        if (isMobile && svgRootEl && initialViewBoxRef.current) {
                            const vb0 = initialViewBoxRef.current;
                            svgRootEl.setAttribute('viewBox', `${vb0.x} ${vb0.y} ${vb0.w} ${vb0.h}`);
                            currentViewBoxRef.current = { ...vb0 };
                            lastPanPointRef.current = null;
                            lastPinchDistanceRef.current = null;
                        }
                    } catch { }
                    setSelectedLot(lotId);
                    // El color fill de selección se gestiona en el efecto de selectedLot
                };

                path.addEventListener('mouseenter', onMouseEnter);
                path.addEventListener('mouseleave', onMouseLeave);
                path.addEventListener('click', onClick);

                (path as any).__listeners = { onMouseEnter, onMouseLeave, onClick };
            });

            // Listo para mostrar el SVG sin flash
            setIsSvgReady(true);

            // Disparar aparición escalonada de lotes sincronizada con la aparición del masterplan
            const baseDelayMs = 80;
            const stepDelayMs = 12;
            requestAnimationFrame(() => {
                pathsRef.current.forEach((p, idx) => {
                    if (!(p as any).__appeared) {
                        const delay = Math.min(420, baseDelayMs + idx * stepDelayMs);
                        setTimeout(() => {
                            try {
                                p.style.opacity = '1';
                                p.style.transform = 'scale(1)';
                                p.style.filter = 'blur(0px)';
                                (p as any).__appeared = true;
                            } catch { }
                        }, delay);
                    }
                });
            });
        };

        const objectElement = svgRef.current;
        if (objectElement) {
            const onLoad = () => {
                setIsSvgReady(false);
                attachListeners();
            };
            objectElement.addEventListener('load', onLoad);
            if (objectElement.contentDocument) {
                setIsSvgReady(false);
                attachListeners();
            }
            return () => {
                objectElement.removeEventListener('load', onLoad);
                if (cleanupGestures) {
                    try { cleanupGestures(); } catch { }
                    cleanupGestures = null;
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
                setIsSvgReady(false);
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

    // Bloquear gestos cuando el modal esté abierto
    useEffect(() => {
        gesturesEnabledRef.current = !selectedLot;
    }, [selectedLot]);

    return { svgRef, selectedLot, setSelectedLot, lotes, isSvgReady };
}