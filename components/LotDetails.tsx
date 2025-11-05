"use client";

import { useEffect, useState } from 'react';
import { LoteAPIResponse } from '@/services/lotes';

interface LotDetailsProps {
    lot?: LoteAPIResponse | null;
}

export default function LotDetails({ lot }: LotDetailsProps) {

    // Imagen para Manzanas A..E: ejemplo A1 -> /Manzana A/F-A-01.jpg, B3 -> /Manzana B/F-B-03.jpg
    const rawId = lot?.id ? String(lot.id) : null;
    let imageUrl: string | null = null;
    let lotNumberLabel: string | null = null;
    let manzanaLetter: string | null = null;
    if (rawId && /^[A-E]\d+$/i.test(rawId)) {
        const letter = rawId.charAt(0).toUpperCase();
        const num = parseInt(rawId.slice(1), 10);
        if (!Number.isNaN(num)) {
            const padded = String(num).padStart(2, '0');
            imageUrl = encodeURI(`/Manzana ${letter}/F-${letter}-${padded}.jpg`);
            lotNumberLabel = String(num);
            manzanaLetter = letter;
        }
    }

    const [imgError, setImgError] = useState<boolean>(false);
    useEffect(() => {
        // Resetear error cuando cambia el lote/imagen
        setImgError(false);
    }, [imageUrl]);

    // No mostramos metadata cuando hay imagen; si en el futuro se necesita, se puede reactivar

    return (
        <div className="bg-white p-0 rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-[90vw] max-h-[90dvh]">
            {imageUrl && !imgError ? (
                <img
                    src={imageUrl}
                    alt={`Manzana ${manzanaLetter ?? ''} - Lote ${lotNumberLabel ?? ''}`}
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