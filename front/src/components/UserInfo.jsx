import Avatar from './Avatar';

export default function UserInfo({ displayName, username, imageUrl, avatarSize = 48, avatarOnly = false }) {
    return (
        <div className="flex items-center gap-3 min-w-0">
            <Avatar imageUrl={imageUrl} size={avatarSize} />

            {!avatarOnly && (
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-gray-900 text-base leading-tight truncate">
                        {displayName}
                    </span>
                    <span className="text-gray-400 text-sm leading-tight truncate">
                        @{username}
                    </span>
                </div>
            )}
        </div>
    );
}