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
        <div className="flex flex-col items-center space-y-4 max-w-5xl">
            <object
                ref={svgRef}
                type="image/svg+xml"
                data="/masterplan.svg"
                className={className}
            />

            {selectedLot && (
                <div className="w-full max-w-md">
                    <LotDetails
                        lotId={formatLotName(selectedLot)}
                        onClear={() => setSelectedLot(null)}
                    />
                </div>
            )}
        </div>
    );
}
