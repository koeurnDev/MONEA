type TikTokIconProps = {
    size?: number;
    className?: string;
};

export function TikTokIcon({ size = 24, className }: TikTokIconProps) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.33V2h-3.57v13.67a2.9 2.9 0 0 1-2.9 2.9 2.9 2.9 0 1 1 2.9-2.9c0-.31-.05-.61-.14-.9v-3.64a6.47 6.47 0 1 0 3.71 5.85V9.99a8.36 8.36 0 0 0 4.89 1.58V8a4.79 4.79 0 0 1-1.12-.13Z" />
        </svg>
    );
}
