interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-14 h-14 text-lg' };

const initials = (name: string) =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

const colorFromName = (name: string) => {
  const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
  return colors[name.charCodeAt(0) % colors.length];
};

export const Avatar = ({ name, avatarUrl, size = 'md', className = '' }: AvatarProps) => {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${SIZE[size]} rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <div className={`${SIZE[size]} ${colorFromName(name)} rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
      {initials(name)}
    </div>
  );
};
