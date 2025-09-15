"use client";

import { useEffect, useState } from 'react';
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

    // Imagen para Manzana A: mapea A1 -> /Manzana A/F-A-01.jpg
    const rawId = lot?.id ? String(lot.id) : null;
    let imageUrl: string | null = null;
    let lotNumberLabel: string | null = null;
    if (rawId && /^A\d+$/i.test(rawId)) {
        const num = parseInt(rawId.slice(1), 10);
        if (!Number.isNaN(num)) {
            const padded = String(num).padStart(2, '0');
            imageUrl = encodeURI(`/Manzana A/F-A-${padded}.jpg`);
            lotNumberLabel = String(num);
        }
    }

    const [imgError, setImgError] = useState<boolean>(false);
    useEffect(() => {
        // Resetear error cuando cambia el lote/imagen
        setImgError(false);
    }, [imageUrl]);

    const extraEntries = Object.entries(lot ?? {}).filter(([key]) => key !== 'id' && key !== 'estado');

    return (
        <div className="bg-white p-0 rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-[90vw] max-h-[90dvh]">
            {imageUrl && !imgError ? (
                <img
                    src={imageUrl}
                    alt={`Manzana A - Lote ${lotNumberLabel ?? ''}`}
                    className="block select-none"
                    style={{ maxWidth: '90vw', maxHeight: '90dvh', width: 'auto', height: 'auto' }}
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className="p-6">
                    <p className="text-center text-gray-700">Aún no está disponible la imagen de ese lote.</p>
                </div>
            )}
        </div>
    );
} 