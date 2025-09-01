import { useEffect, useState } from 'react';
import { getLotesEtapa1, LoteAPIResponse } from '@/services/lotes';

export interface UseLotesResult {
    data: LoteAPIResponse[] | null;
    loading: boolean;
    error: Error | null;
    reload: () => void;
}

export function useLotesEtapa1(): UseLotesResult {
    const [data, setData] = useState<LoteAPIResponse[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [nonce, setNonce] = useState<number>(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        getLotesEtapa1()
            .then((res) => {
                if (!cancelled) setData(res);
                console.log(res)
            })
            .catch((err: Error) => {
                if (!cancelled) setError(err);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [nonce]);

    return {
        data,
        loading,
        error,
        reload: () => setNonce((n) => n + 1),
    };
}