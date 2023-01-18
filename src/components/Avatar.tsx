type AvatarProps = {
  size?: number;
  alt?: string;
  src?: string;
};

export const Avatar = ({ alt, src, size = 64 }: AvatarProps) => {
  return alt ? (
    <img
      width={size}
      height={size}
      alt={alt}
      src={
        src ||
        `https://ui-avatars.com/api/?name=${alt}&rounded=true&format=svg&background=random`
      }
    />
  ) : null;
};
