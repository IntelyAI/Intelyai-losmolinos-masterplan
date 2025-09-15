'use client';

import LotDetails from '@/components/LotDetails';
import { useInteractiveSVG } from '@/hooks/useInteractiveSVG';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useMemo } from 'react';
import { SVG_CONFIG } from '@/config/svg';
import { useOrientation } from '@/hooks/useOrientation';

interface InteractiveSVGProps {
    className?: string;
}

export default function InteractiveSVG({ className }: InteractiveSVGProps) {
    const { svgRef, selectedLot, setSelectedLot, lotes, isSvgReady } = useInteractiveSVG();
    const { orientation, isMobile } = useOrientation();
    const stackLegendVertical = isMobile && orientation === 'landscape';
    const centerInPortrait = isMobile && orientation === 'portrait';

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
                <div className="w-full sm:absolute sm:inset-0 sm:w-full sm:h-full">
                    {!isSvgReady && (
                        <div className="absolute inset-0 z-10">
                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 animate-pulse" />
                        </div>
                    )}
                    <object
                        ref={svgRef}
                        type="image/svg+xml"
                        data="/masterplan.svg"
                        className={`${className ?? ''} w-full h-auto ${centerInPortrait ? 'max-h-[100dvh]' : ''} sm:h-full sm:max-w-[100vw] sm:max-h-[100vh] ${isSvgReady ? 'opacity-100' : 'opacity-0'}`}
                        style={{ display: 'block', objectFit: 'contain', objectPosition: 'center center', overflow: 'hidden', touchAction: isMobile ? 'none' : undefined, transition: 'opacity 300ms ease, transform 500ms ease, filter 400ms ease', transform: isMobile ? undefined : (isSvgReady ? 'scale(1)' : 'scale(0.985)'), filter: isSvgReady ? 'blur(0px)' : 'blur(1px)' }}
                    />
                </div>
            </div>

            {/* Leyenda estados */}
            <div
                className="pointer-events-none absolute left-4 bottom-4 sm:left-6 sm:bottom-6"
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

            <Dialog open={!!selectedLot} onOpenChange={(open) => { if (!open) setSelectedLot(null); }}>
                <DialogContent className="p-0 w-auto max-w-none h-auto max-h-[90dvh]">
                    <LotDetails lot={selectedLotData} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
