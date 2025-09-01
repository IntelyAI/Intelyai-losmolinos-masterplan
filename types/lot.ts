export type LotStatus = 'none' | 'orange' | 'yellow' | 'red';

export const LOT_STATUS_CLASS_BY_STATUS: Record<LotStatus, string> = {
    none: 'status-none',
    orange: 'status-orange',
    yellow: 'status-yellow',
    red: 'status-red',
};


