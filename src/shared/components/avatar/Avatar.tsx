import * as styles from './Avatar.css';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarStatus = 'online' | 'away' | 'offline';

type Props = {
  name: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  imageSrc?: string;
  role?: string;
  showNameGroup?: boolean;
};

const Avatar = ({ name, size = 'md', status, imageSrc, role, showNameGroup = false }: Props) => {
  const initial = name.charAt(0);

  const avatarEl = (
    <div className={styles.wrapper}>
      <div className={styles.avatar({ size })}>
        {imageSrc ? <img src={imageSrc} alt={name} className={styles.image} /> : initial}
      </div>
      {status && <span className={styles.statusDot({ size, status })} />}
    </div>
  );

  if (showNameGroup) {
    return (
      <div className={styles.nameGroup}>
        {avatarEl}
        <span className={styles.nameLabel}>
          {name}
          {role ? ` ${role}` : ''}
        </span>
      </div>
    );
  }

  return avatarEl;
};

export default Avatar;
