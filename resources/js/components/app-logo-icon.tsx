import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({
    className,
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            width={24}
            height={24}
            decoding="async"
            {...props}
            src="/images/logo-kejati.png"
            alt={props.alt ?? 'Logo Kejati'}
            className={['block object-contain', className]
                .filter(Boolean)
                .join(' ')}
            style={{
                display: 'block',
                ...props.style,
            }}
        />
    );
}
