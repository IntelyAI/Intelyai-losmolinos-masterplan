export interface ApiError extends Error {
    status: number;
    url: string;
    details?: unknown;
}

export type ApiRequestInit = Omit<RequestInit, 'body' | 'headers'> & {
    headers?: Record<string, string>;
    body?: unknown;
    timeoutMs?: number;
};

function buildUrl(path: string): string {
    const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
}

function toJsonBody(body: unknown): BodyInit | undefined {
    if (body === undefined || body === null) return undefined;
    return typeof body === 'string' ? body : JSON.stringify(body);
}

export async function apiFetch<TResponse>(path: string, init: ApiRequestInit = {}): Promise<TResponse> {
    const { headers = {}, body, timeoutMs = 15000, ...rest } = init;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(buildUrl(path), {
            ...rest,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...headers,
            },
            body: toJsonBody(body),
            signal: controller.signal,
        });

        const contentType = res.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const payload = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

        if (!res.ok) {
            const error: ApiError = Object.assign(new Error(`HTTP ${res.status} fetching ${res.url}`), {
                status: res.status,
                url: res.url,
                details: payload,
            });
            throw error;
        }

        return payload as TResponse;
    } finally {
        clearTimeout(timeout);
    }
} 