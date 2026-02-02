'use client';

import LotDetails from '@/components/LotDetails';
import { useInteractiveSVG } from '@/hooks/useInteractiveSVG';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useEffect, useMemo, useState } from 'react';
import { SVG_CONFIG } from '@/config/svg';
import { useOrientation } from '@/hooks/useOrientation';

interface InteractiveSVGProps {
    className?: string;
}

export default function InteractiveSVG({ className }: InteractiveSVGProps) {
    const [introVisible, setIntroVisible] = useState(true);
    const [introFading, setIntroFading] = useState(false);
    const [minTimePassed, setMinTimePassed] = useState(false);
    const [printDate, setPrintDate] = useState<string>('');
    const { svgRef, selectedLot, setSelectedLot, lotes, isSvgReady } = useInteractiveSVG(introFading);
    const { orientation, isMobile } = useOrientation();
    const stackLegendVertical = isMobile && orientation === 'landscape';
    const centerInPortrait = isMobile && orientation === 'portrait';

    const formatDate = (d: Date) => {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const downloadPNG = async () => {
        try {
            const svgDoc = svgRef.current?.contentDocument;
            const svgEl = svgDoc?.querySelector('svg') as SVGSVGElement | null;
            if (!svgEl) return;
            const rect = svgEl.getBoundingClientRect();
            const width = Math.max(1, Math.floor(rect.width));
            const height = Math.max(1, Math.floor(rect.height));

            const clone = svgEl.cloneNode(true) as SVGSVGElement;
            clone.setAttribute('width', String(width));
            clone.setAttribute('height', String(height));
            const xml = new XMLSerializer().serializeToString(clone);
            const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);

            await new Promise<void>((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
                    const canvas = document.createElement('canvas');
                    canvas.width = width * dpr;
                    canvas.height = height * dpr;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return resolve();
                    ctx.scale(dpr, dpr);
                    ctx.drawImage(img, 0, 0, width, height);

                    // Dibujar leyenda (panel unificado bottom-left)
                    try {
                        const items = [
                            { key: 'vendido', label: 'Vendido' },
                            { key: 'reservado', label: 'Reservado' },
                            { key: 'guardado', label: 'Guardado' },
                            { key: 'libre', label: 'Libre' },
                        ] as const;
                        const padding = 16; const gap = 14; const box = 12; const textPad = 8;
                        ctx.font = '13px Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
                        ctx.textBaseline = 'middle';
                        // medir ancho total
                        let totalW = 0;
                        items.forEach(({ label }, i) => {
                            const w = box + textPad + ctx.measureText(label).width + (i < items.length - 1 ? gap : 0);
                            totalW += w;
                        });
                        const panelH = box + 12;
                        const panelW = totalW + 16;
                        const panelX = padding;
                        const panelY = height - padding - panelH;
                        // fondo unificado
                        ctx.fillStyle = 'rgba(255,255,255,0.88)';
                        ctx.fillRect(panelX, panelY, panelW, panelH);
                        // contenido
                        let x = panelX + 8;
                        const y = panelY + panelH / 2;
                        items.forEach(({ key, label }) => {
                            const fill = key === 'libre' ? '#ffffff' : (SVG_CONFIG.stateColorByStatus[key] ?? 'transparent');
                            const stroke = key === 'libre' ? 'rgba(100,116,139,0.6)' : (SVG_CONFIG.stateStrokeColorByStatus[key] ?? 'transparent');
                            ctx.fillStyle = fill;
                            ctx.fillRect(x, y - box / 2, box, box);
                            ctx.strokeStyle = stroke; ctx.lineWidth = 1;
                            ctx.strokeRect(x, y - box / 2, box, box);
                            x += box + textPad;
                            ctx.fillStyle = '#0f172a';
                            ctx.fillText(label, x, y);
                            x += ctx.measureText(label).width + gap;
                        });

                        // Fecha (bottom-right)
                        const dateStr = `Fecha: ${formatDate(new Date())}`;
                        ctx.font = '13px Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
                        ctx.textBaseline = 'middle';
                        const textW = ctx.measureText(dateStr).width;
                        const bx = width - padding - textW - 16;
                        const by = height - padding - (box + 12);
                        ctx.fillStyle = 'rgba(255,255,255,0.92)';
                        ctx.fillRect(bx - 8, by - 6, textW + 16, box + 16);
                        ctx.fillStyle = '#0f172a';
                        ctx.fillText(dateStr, bx, by + (box + 12) / 2);
                    } catch { }

                    canvas.toBlob((blob) => {
                        if (!blob) return resolve();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'masterplan.png';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                        resolve();
                    });
                };
                img.onerror = () => resolve();
                img.src = svgDataUrl;
            });
        } catch { }
    };

    useEffect(() => {
        const t = setTimeout(() => setMinTimePassed(true), 1600);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (isSvgReady && minTimePassed && introVisible && !introFading) {
            setIntroFading(true);
            const t = setTimeout(() => setIntroVisible(false), 520);
            return () => clearTimeout(t);
        }
    }, [isSvgReady, minTimePassed, introVisible, introFading]);

    const selectedLotData = useMemo(() => {
        if (!selectedLot || !lotes) return null;
        return lotes.find(l => String(l.id) === String(selectedLot)) ?? null;
    }, [selectedLot, lotes]);

    return (
        <div
            className="relative w-full h-full sm:overflow-hidden"
            data-orientation={orientation}
            data-mobile={isMobile ? 'true' : 'false'}
        >
            <div className="grid place-items-center h-full sm:absolute sm:inset-0 sm:overflow-hidden">
                {(introFading || !introVisible) && (
                    <div className="no-print fixed right-4 top-4 z-20 flex gap-2">
                        <button
                            type="button"
                            onClick={() => { try { setPrintDate(formatDate(new Date())); setTimeout(() => window.print(), 50); } catch { } }}
                            className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white px-4 py-2 text-sm shadow-md hover:bg-slate-800 active:bg-slate-700 transition-colors"
                        >
                            Descargar PDF
                        </button>
                        <button
                            type="button"
                            onClick={downloadPNG}
                            className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white px-4 py-2 text-sm shadow-md hover:bg-slate-800 active:bg-slate-700 transition-colors"
                        >
                            Descargar PNG
                        </button>
                    </div>
                )}
                <div className="w-full sm:absolute sm:inset-0 sm:w-full sm:h-full">
                    {introVisible && (
                        <div className={`absolute inset-0 z-10 grid place-items-center transition-opacity duration-500 ${introFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} data-role="intro-overlay">
                            <div className="relative w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                                <div className="absolute inset-0 grid place-items-center">
                                    <div className="flex flex-col items-center">
                                        <img
                                            src="/logo.png"
                                            alt="Logo"
                                            className="opacity-95 h-auto w-[48vw] max-w-[520px] min-w-[200px] drop-shadow-[0_6px_18px_rgba(0,0,0,0.25)] animate-[logoIn_700ms_cubic-bezier(.22,1,.36,1)_both]"
                                        />
                                        <div className="mt-6 h-1 w-[60vw] max-w-[640px] min-w-[240px] overflow-hidden rounded bg-slate-300/60 dark:bg-slate-700/60">
                                            <div className="h-full w-0 animate-[progress_1.8s_cubic-bezier(.22,1,.36,1)_forwards] bg-slate-700/80 dark:bg-slate-200/80" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <object
                        ref={svgRef}
                        type="image/svg+xml"
                        data="/masterplan.svg"
                        className={`${className ?? ''} w-full h-auto ${centerInPortrait ? 'max-h-[100dvh]' : ''} sm:h-full sm:max-w-[100vw] sm:max-h-[100vh] ${(isSvgReady && introFading) ? 'opacity-100' : 'opacity-0'}`}
                        style={{ display: 'block', objectFit: 'contain', objectPosition: 'center center', overflow: 'hidden', touchAction: isMobile ? 'none' : undefined, transition: 'opacity 380ms ease, transform 640ms cubic-bezier(.22,1,.36,1), filter 460ms ease', transform: isMobile ? undefined : ((isSvgReady && introFading) ? 'scale(1)' : 'scale(0.985)'), filter: (isSvgReady && introFading) ? 'blur(0px)' : 'blur(1px)' }}
                    />
                </div>
            </div>

            {/* Leyenda estados */}
            <div
                className="pointer-events-none absolute left-4 bottom-4 sm:left-6 sm:bottom-6"
                data-role="legend"
            >
                <div className="pointer-events-auto rounded-lg border border-gray-200/80 bg-white/80 backdrop-blur-md shadow-lg dark:border-gray-700/70 dark:bg-slate-900/70">
                    <div className={`${stackLegendVertical ? 'flex flex-col items-start gap-3' : 'flex items-center gap-4'} px-4 py-3`}>
                        {([
                            { key: 'vendido', label: 'Vendido' },
                            { key: 'reservado', label: 'Reservado' },
                            { key: 'guardado', label: 'Guardado' },
                            { key: 'libre', label: 'Libre' },
                        ] as const).map(({ key, label }) => {
                            const isLibre = key === 'libre';
                            const fill = isLibre ? '#ffffff' : (SVG_CONFIG.stateColorByStatus[key] ?? 'transparent');
                            const stroke = isLibre ? 'rgba(100,116,139,0.6)' : (SVG_CONFIG.stateStrokeColorByStatus[key] ?? 'transparent');
                            return (
                                <div key={key} className="flex items-center gap-2">
                                    <span
                                        aria-hidden
                                        className="inline-block h-3.5 w-3.5 rounded-[3px] ring-1"
                                        style={{
                                            backgroundColor: fill,
                                            boxShadow: `inset 0 0 0 1px ${stroke}`,
                                        }}
                                    />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Fecha para impresión */}
            <div className="hidden print:block fixed right-4 bottom-4 z-10 text-sm bg-white/85 text-slate-900 px-3 py-1 rounded shadow ring-1 ring-slate-200">
                Fecha: {printDate}
            </div>

            <Dialog open={!!selectedLot} onOpenChange={(open) => { if (!open) setSelectedLot(null); }}>
                <DialogContent className="p-0 w-auto max-w-none h-auto max-h-[90dvh]">
                    <LotDetails lot={selectedLotData} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
