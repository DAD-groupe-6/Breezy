'use client';

import { FaUser } from "react-icons/fa";
import { useTranslation } from '@/hooks/useTranslation';

export default function Avatar({ imageUrl, size = 64 }) {
    const { t } = useTranslation();
    return (
        <div style={{ width: `${size}px`, height: `${size}px` }}
            className="w-16 h-16 rounded-full bg-[var(--color-bg-surface-2)] overflow-hidden flex items-center justify-center shrink-0 text-[var(--color-text-secondary)]">

            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={t('avatar.alt')}
                    className="w-full h-full object-cover"
                />
            ) : (<FaUser size={size * 0.5} />)}

        </div>
    );
}