import { useSyncExternalStore } from 'react';
import { toast } from 'sonner';

type RateLimitState = {
    secondsLeft: number;
    message: string | null;
};

let state: RateLimitState = {
    secondsLeft: 0,
    message: null,
};

let timerId: number | null = null;
const listeners = new Set<() => void>();

function emitChange(): void {
    for (const listener of listeners) {
        listener();
    }
}

function clearTimer(): void {
    if (timerId !== null && typeof window !== 'undefined') {
        window.clearInterval(timerId);
        timerId = null;
    }
}

function formatMessage(seconds: number): string {
    return `Silakan tunggu ${seconds} detik sebelum mencoba kembali.`;
}

export function clearRateLimit(): void {
    clearTimer();

    if (state.secondsLeft === 0 && state.message === null) {
        return;
    }

    state = {
        secondsLeft: 0,
        message: null,
    };
    emitChange();
}

export function notifyRateLimited(
    retryAfterSeconds?: number,
    customMessage?: string,
): void {
    const seconds = Math.max(
        1,
        Number.isFinite(retryAfterSeconds) ? Math.ceil(retryAfterSeconds!) : 60,
    );
    const toastMessage = customMessage?.trim() || formatMessage(seconds);

    toast.error(toastMessage);

    clearTimer();

    state = {
        secondsLeft: seconds,
        message: formatMessage(seconds),
    };
    emitChange();

    if (typeof window !== 'undefined') {
        timerId = window.setInterval(() => {
            if (state.secondsLeft <= 1) {
                clearRateLimit();

                return;
            }

            const nextSeconds = state.secondsLeft - 1;
            state = {
                secondsLeft: nextSeconds,
                message: formatMessage(nextSeconds),
            };
            emitChange();
        }, 1000);
    }
}

export function extractRetryAfterFromInertiaResponse(response?: {
    headers?: Record<string, string | undefined>;
    data?: unknown;
}): { retryAfter: number; message?: string } {
    const data =
        response?.data && typeof response.data === 'object'
            ? (response.data as { retry_after?: unknown; message?: unknown })
            : null;

    const fromData =
        typeof data?.retry_after === 'number'
            ? data.retry_after
            : Number(data?.retry_after);
    const fromHeader = Number(response?.headers?.['retry-after']);

    const retryAfter =
        Number.isFinite(fromData) && fromData > 0
            ? fromData
            : Number.isFinite(fromHeader) && fromHeader > 0
              ? fromHeader
              : 60;

    const message =
        typeof data?.message === 'string' && data.message.trim().length > 0
            ? data.message
            : undefined;

    return { retryAfter, message };
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot(): RateLimitState {
    return state;
}

const serverSnapshot: RateLimitState = {
    secondsLeft: 0,
    message: null,
};

function getServerSnapshot(): RateLimitState {
    return serverSnapshot;
}

export function useRateLimit(): RateLimitState & {
    isRateLimited: boolean;
    clear: () => void;
} {
    const snapshot = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );

    return {
        ...snapshot,
        isRateLimited: snapshot.secondsLeft > 0,
        clear: clearRateLimit,
    };
}
