import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/favicon.svg"
            alt={props.alt ?? 'Logo'}
            className={['block object-contain', className].filter(Boolean).join(' ')}
            style={{
                display: 'block',
                ...(props.style ?? {}),
            }}
        />
    );
}
