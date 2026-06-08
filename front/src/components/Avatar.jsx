import { FaUser } from "react-icons/fa";
export default function Avatar({ imageUrl, size = 64 }) {
    return (
        <div style={{ width: `${size}px`, height: `${size}px` }}
            className="w-16 h-16 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center shrink-0">

            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt="Profil Picture"
                    className="w-full h-full object-cover"
                />
            ) : (<FaUser size={size * 0.5} />)}

        </div>
    );
}