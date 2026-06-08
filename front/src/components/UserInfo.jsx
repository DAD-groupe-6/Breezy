import Avatar from './Avatar';

export default function UserInfo({ displayName, username, imageUrl, avatarSize = 48, avatarOnly = false }) {
    return (
        <div className="flex items-center gap-3">
            <Avatar imageUrl={imageUrl} size={avatarSize} />

            {!avatarOnly && (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-base leading-tight">
                        {displayName}
                    </span>
                    <span className="text-gray-400 text-sm leading-tight">
                        @{username}
                    </span>
                </div>
            )}
        </div>
    );
}