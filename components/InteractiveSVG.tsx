'use client';

import LotDetails from '@/components/LotDetails';
import { useInteractiveSVG } from '@/hooks/useInteractiveSVG';
import { formatLotName } from '@/utils/lot';

interface InteractiveSVGProps {
    className?: string;
}

export default function InteractiveSVG({ className }: InteractiveSVGProps) {
    const { svgRef, selectedLot, setSelectedLot } = useInteractiveSVG();

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

            {selectedLot && (
                <div className="absolute bottom-4 right-4 w-full max-w-md z-10">
                    <LotDetails
                        lotId={formatLotName(selectedLot)}
                        onClear={() => setSelectedLot(null)}
                    />
                </div>
            )}
        </div>
    );
}
