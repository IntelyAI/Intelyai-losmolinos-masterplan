interface LotDetailsProps {
    lotId: string;
    onClear: () => void;
}

export default function LotDetails({ lotId, onClear }: LotDetailsProps) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Lote Seleccionado</h3>
            <p className="text-gray-600 mt-2">{lotId}</p>
            <p className="text-sm text-gray-500 mt-1">ID: {lotId}</p>
            <button
                onClick={onClear}
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                Deseleccionar
            </button>
        </div>
    );
} 