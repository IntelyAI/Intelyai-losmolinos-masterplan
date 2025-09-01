'use client';

import LotDetails from '@/components/LotDetails';
import { useInteractiveSVG } from '@/hooks/useInteractiveSVG';
import { formatLotName } from '@/utils/lot';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMemo } from 'react';

interface InteractiveSVGProps {
    className?: string;
}

export default function InteractiveSVG({ className }: InteractiveSVGProps) {
    const { svgRef, selectedLot, setSelectedLot, lotes } = useInteractiveSVG();

    const selectedLotData = useMemo(() => {
        if (!selectedLot || !lotes) return null;
        return lotes.find(l => String(l.id) === String(selectedLot)) ?? null;
    }, [selectedLot, lotes]);

    return (
        <div className="relative w-full h-full overflow-hidden">
            <div className="absolute inset-0 grid place-items-center overflow-hidden">
                <object
                    ref={svgRef}
                    type="image/svg+xml"
                    data="/masterplan.svg"
                    className={className}
                    style={{ display: 'block', width: '100%', height: '100%', maxWidth: '100vw', maxHeight: '100vh', objectFit: 'contain', objectPosition: 'center center', overflow: 'hidden' }}
                />
            </div>

            <Dialog open={!!selectedLot} onOpenChange={(open) => { if (!open) setSelectedLot(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedLot ? formatLotName(selectedLot) : 'Lote'}</DialogTitle>
                    </DialogHeader>
                    <LotDetails lotId={selectedLot ? formatLotName(selectedLot) : undefined} lot={selectedLotData} onClear={() => setSelectedLot(null)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
