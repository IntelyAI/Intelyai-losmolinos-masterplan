import { apiFetch } from './apiClient';

export type LoteEstado = 'libre' | 'reservado' | 'vendido' | 'guardado' | string;

export interface LoteAPIResponse {
    id: string;
    estado: LoteEstado;
    [key: string]: unknown;
}

export async function getLotesByEtapa(etapa: number): Promise<LoteAPIResponse[]> {
    return apiFetch<LoteAPIResponse[]>(`/lotes/etapa/${etapa}`);
}

export async function getLotesEtapa1(): Promise<LoteAPIResponse[]> {
    return getLotesByEtapa(1);
}