// Función para generar todos los IDs de lotes automáticamente
function generateAllLotIds(): string[] {
    const manzanas: Record<string, number> = {
        A: 24, // A1 a A24
        B: 21, // B1 a B21
        C: 21, // C1 a C21
        D: 46, // D1 a D46
        E: 33, // E1 a E33,
    };

    const allIds: string[] = [];

    Object.entries(manzanas).forEach(([manzana, maxLote]) => {
        for (let i = 1; i <= maxLote; i++) {
            allIds.push(`${manzana}${i}`);
        }
    });

    return allIds;
}

export const SVG_CONFIG = {
    interactivePaths: generateAllLotIds(),
    defaultColor: 'transparent',
    hoverColor: 'rgba(27, 70, 47, 0.35)',
    selectedColor: 'rgba(27, 70, 47, 0.5)',
    stateColorByStatus: {
        libre: 'transparent',
        guardado: 'rgba(136, 141, 150, 0.35)', // gris
        reservado: 'rgba(226, 163, 53, 0.35)', // amarillo
        vendido: 'rgba(229, 94, 94, 0.35)', // rojo
    } as Record<string, string>,
    stateStrokeColorByStatus: {
        libre: 'transparent',
        guardado: 'rgba(136, 141, 150, 1)',
        reservado: 'rgba(226, 163, 53, 1)',
        vendido: 'rgba(229, 94, 94, 1)',
    } as Record<string, string>,
    strokeWidth: '1',
    transitionDuration: '0.3s',
    transitionEasing: 'ease',
} as const; 