import { LoteAPIResponse } from '@/services/lotes';
import { formatLotName } from '@/utils/lot';

interface LotDetailsProps {
    lotId?: string;
    lot?: LoteAPIResponse | null;
    onClear: () => void;
}

export default function LotDetails({ lotId, lot, onClear }: LotDetailsProps) {
    const resolvedId = lotId ?? (lot ? formatLotName(String(lot.id)) : '');
    const estado = lot?.estado;

    const extraEntries = Object.entries(lot ?? {}).filter(([key]) => key !== 'id' && key !== 'estado');

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Lote Seleccionado</h3>
            {resolvedId && <p className="text-gray-600 mt-2">{resolvedId}</p>}
            {estado && <p className="text-sm text-gray-700 mt-1">Estado: <span className="font-medium capitalize">{String(estado)}</span></p>}

            {extraEntries.length > 0 && (
                <div className="mt-3 space-y-1">
                    {extraEntries.map(([key, value]) => (
                        <p key={key} className="text-sm text-gray-500">
                            <span className="font-medium mr-1 capitalize">{key}:</span>
                            <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                        </p>
                    ))}
                </div>
            )}

            <button
                onClick={onClear}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                Cerrar
            </button>
        </div>
    );
} 