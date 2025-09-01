export function formatLotName(lotId: string): string {
    const manzana = lotId.charAt(0);
    const numero = lotId.slice(1);
    return `Manzana ${manzana}, Lote ${numero}`;
} 