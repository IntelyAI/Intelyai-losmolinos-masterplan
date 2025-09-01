import { useEffect, useState } from 'react';

export type DeviceOrientation = 'portrait' | 'landscape';

export interface UseOrientationResult {
    orientation: DeviceOrientation;
    isLandscape: boolean;
    isPortrait: boolean;
    isMobile: boolean;
}

function getIsMobile(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 640;
    } catch {
        return window.innerWidth < 640;
    }
}

function getOrientation(): DeviceOrientation {
    if (typeof window === 'undefined') return 'portrait';
    try {
        return window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait';
    } catch {
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }
}

export function useOrientation(): UseOrientationResult {
    const [orientation, setOrientation] = useState<DeviceOrientation>('portrait');
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        setOrientation(getOrientation());
        setIsMobile(getIsMobile());

        const onResize = () => {
            setOrientation(getOrientation());
            setIsMobile(getIsMobile());
        };

        const mq = typeof window !== 'undefined'
            ? window.matchMedia('(orientation: landscape)')
            : null;

        if (mq) {
            if (typeof mq.addEventListener === 'function') {
                mq.addEventListener('change', onResize);
            } else if (typeof (mq as any).addListener === 'function') {
                (mq as any).addListener(onResize);
            }
        }

        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            if (mq) {
                if (typeof mq.removeEventListener === 'function') {
                    mq.removeEventListener('change', onResize);
                } else if (typeof (mq as any).removeListener === 'function') {
                    (mq as any).removeListener(onResize);
                }
            }
        };
    }, []);

    return {
        orientation,
        isLandscape: orientation === 'landscape',
        isPortrait: orientation === 'portrait',
        isMobile,
    };
}


