// Función para generar todos los IDs de lotes automáticamente
function generateAllLotIds(): string[] {
    const manzanas = {
        A: 24,  // A1 a A24
        B: 21,  // B1 a B21
        C: 21,  // C1 a C21
        D: 46,  // D1 a D46
        E: 33   // E1 a E33
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
    defaultColor: 'transparent', // Color transparente por defecto
    hoverColor: '#3B82F6', // Azul de Tailwind
    transitionDuration: '0.3s',
    transitionEasing: 'ease'
} as const;
