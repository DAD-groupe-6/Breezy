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
        <div className={`flex min-w-0 items-center gap-3 ${className}`}>
            <Avatar imageUrl={imageUrl} size={avatarSize} />

            {!avatarOnly && (
                <div className={`flex min-w-0 flex-col ${textContainerClassName}`}>
                    <span className={`truncate text-base font-bold leading-tight text-[var(--color-text-primary)] ${displayNameClassName}`}>
                        {displayName}
                    </span>
                    <span className={`truncate text-sm leading-tight text-[var(--color-text-secondary)] ${usernameClassName}`}>
                        @{username}
                    </span>
                </div>
            )}
        </div>
    )
}