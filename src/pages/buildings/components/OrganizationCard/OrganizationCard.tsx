import BuildingIcon from '@assets/icons/ic-building.svg?react';

import * as styles from './OrganizationCard.css';

interface OrganizationCardProps {
  schoolName: string;
  buildingCount: number;
}

// 기관 주소 필드는 백엔드에 아직 없음(project_floorplans_api_mismatch 메모 참고) — 생기면 추가
const OrganizationCard = ({ schoolName, buildingCount }: OrganizationCardProps) => (
  <div className={styles.container}>
    <div className={styles.left}>
      <div className={styles.iconBox}>
        <BuildingIcon width={24} height={24} />
      </div>
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{schoolName}</span>
        </div>
      </div>
    </div>
    <div className={styles.right}>
      <span className={styles.count}>{buildingCount}</span>
      <span className={styles.countLabel}>등록 건물</span>
    </div>
  </div>
);

export default OrganizationCard;
