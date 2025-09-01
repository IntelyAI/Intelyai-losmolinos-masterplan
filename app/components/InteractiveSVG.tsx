'use client';

import { useEffect, useRef, useState } from 'react';
import { SVG_CONFIG } from '../config/svgConfig';

interface InteractiveSVGProps {
    className?: string;
}

export default function InteractiveSVG({ className }: InteractiveSVGProps) {
    const svgRef = useRef<HTMLObjectElement>(null);
    const [selectedLot, setSelectedLot] = useState<string | null>(null);

    useEffect(() => {
        const handleSVGLoad = () => {
            const svgDoc = svgRef.current?.contentDocument;
            if (!svgDoc) return;

            // Obtener los paths configurados
            const paths = SVG_CONFIG.interactivePaths.map(id =>
                svgDoc.getElementById(id)
            ).filter(Boolean);

            // Aplicar estilos y eventos a cada path
            paths.forEach(path => {
                if (path) {
                    const lotId = path.id;

                    // Estilo inicial - transparente por defecto
                    path.style.transition = `fill ${SVG_CONFIG.transitionDuration} ${SVG_CONFIG.transitionEasing}`;
                    path.style.cursor = 'pointer';
                    path.style.fill = selectedLot === lotId ? '#10B981' : SVG_CONFIG.defaultColor; // Verde si está seleccionado

                    // Evento hover
                    path.addEventListener('mouseenter', () => {
                        if (selectedLot !== lotId) {
                            path.style.fill = SVG_CONFIG.hoverColor;
                        }
                    });

                    path.addEventListener('mouseleave', () => {
                        if (selectedLot !== lotId) {
                            path.style.fill = SVG_CONFIG.defaultColor; // Volver a transparente
                        }
                    });

                    // Evento click
                    path.addEventListener('click', () => {
                        setSelectedLot(lotId);
                        // Actualizar el color de todos los lotes
                        paths.forEach(p => {
                            if (p) {
                                p.style.fill = p.id === lotId ? '#10B981' : SVG_CONFIG.defaultColor;
                            }
                        });
                    });
                }
            });
        };

        const objectElement = svgRef.current;
        if (objectElement) {
            objectElement.addEventListener('load', handleSVGLoad);

            // Si el SVG ya está cargado
            if (objectElement.contentDocument) {
                handleSVGLoad();
            }
        }

        return () => {
            if (objectElement) {
                objectElement.removeEventListener('load', handleSVGLoad);
            }
        };
    }, [selectedLot]);

    const getManzanaName = (lotId: string) => {
        const manzana = lotId.charAt(0);
        const numero = lotId.slice(1);
        return `Manzana ${manzana}, Lote ${numero}`;
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <object
                ref={svgRef}
                type="image/svg+xml"
                data="/masterplan.svg"
                className={className}
            />

            {selectedLot && (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Lote Seleccionado
                    </h3>
                    <p className="text-gray-600 mt-2">
                        {getManzanaName(selectedLot)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        ID: {selectedLot}
                    </p>
                    <button
                        onClick={() => setSelectedLot(null)}
                        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Deseleccionar
                    </button>
                </div>
            )}
        </div>
    );
}
