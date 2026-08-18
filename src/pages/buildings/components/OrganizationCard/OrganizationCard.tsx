import BuildingIcon from '@assets/icons/ic-building.svg?react';

import * as styles from './OrganizationCard.css';

import type { Organization } from '../../types/buildings';

interface OrganizationCardProps {
  organization: Organization;
  buildingCount: number;
}

const OrganizationCard = ({ organization, buildingCount }: OrganizationCardProps) => (
  <div className={styles.container}>
    <div className={styles.left}>
      <div className={styles.iconBox}>
        <BuildingIcon width={24} height={24} />
      </div>
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{organization.name}</span>
        </div>
        <p className={styles.address}>{organization.address}</p>
      </div>
    </div>
    <div className={styles.right}>
      <span className={styles.count}>{buildingCount}</span>
      <span className={styles.countLabel}>등록 건물</span>
    </div>
  </div>
);

export default OrganizationCard;
