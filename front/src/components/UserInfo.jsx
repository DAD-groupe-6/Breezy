import Avatar from './Avatar'

export default function UserInfo({
    displayName,
    username,
    imageUrl,
    avatarSize = 48,
    avatarOnly = false,
    className = '',
    textContainerClassName = '',
    displayNameClassName = '',
    usernameClassName = '',
}) {
    return (
        <div className={`flex min-w-0 items-center gap-[var(--space-sm)] ${className}`}>
            <Avatar imageUrl={imageUrl} size={avatarSize} />

            {!avatarOnly && (
                <div className={`flex min-w-0 flex-col ${textContainerClassName}`}>
                    <span className={`truncate text-base leading-tight text-[var(--color-text-primary)] [font-weight:var(--font-weight-title)] [letter-spacing:var(--tracking-title)] ${displayNameClassName}`}>
                        {displayName}
                    </span>
                    <span className={`truncate text-sm leading-tight text-[var(--color-text-secondary)] [font-weight:var(--font-weight-regular)] ${usernameClassName}`}>
                        @{username}
                    </span>
                </div>
            )}
        </div>
    )
}