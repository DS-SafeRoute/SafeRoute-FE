import { useState } from 'react';

import PlusIcon from '@assets/icons/ic-plus.svg?react';

import { Button } from '@components/Button';
import GNB from '@components/gnb';
import Modal from '@components/modal';

import * as styles from './BuildingsPage.css';
import BuildingCard from './components/BuildingCard/BuildingCard';
import OrganizationCard from './components/OrganizationCard/OrganizationCard';
import { mockBuildings, mockOrganization } from './mocks/buildingsData';

import type { Building } from './types/buildings';

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; building: Building }
  | { type: 'delete'; building: Building }
  | null;

const BuildingsPage = () => {
  const [buildings, setBuildings] = useState<Building[]>(mockBuildings);
  const [modal, setModal] = useState<ModalState>(null);

  const handleAdd = () => setModal({ type: 'add' });
  const handleEdit = (building: Building) => setModal({ type: 'edit', building });
  const handleDelete = (building: Building) => setModal({ type: 'delete', building });
  const handleFloorPlan = (_building: Building) => {
    // TODO: 도면 관리 페이지로 이동
  };

  const handleConfirmDelete = () => {
    if (modal?.type !== 'delete') return;
    setBuildings((prev) => prev.filter((b) => b.id !== modal.building.id));
    setModal(null);
  };

  const handleCloseModal = () => setModal(null);

  return (
    <>
      <GNB
        breadcrumbs={[{ label: '훈련 관리' }]}
        title="건물 관리"
        description="등록된 건물과 시설을 관리합니다"
        userName="김안전"
        userRole="관리자"
      />

      <div className={styles.container}>
        <OrganizationCard organization={mockOrganization} buildingCount={buildings.length} />

        <div className={styles.listHeader}>
          <span className={styles.listCount}>총 {buildings.length}개 건물</span>
          <Button onClick={handleAdd}>
            <PlusIcon width={16} height={16} />
            건물 추가
          </Button>
        </div>

        <div className={styles.grid}>
          {buildings.map((building) => (
            <BuildingCard
              key={building.id}
              building={building}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onFloorPlan={handleFloorPlan}
            />
          ))}
        </div>
      </div>

      {modal?.type === 'add' && (
        <Modal
          open
          onClose={handleCloseModal}
          title="건물 추가"
          description="새 건물 정보를 입력합니다"
          footer={
            <>
              <Button variant="ghost" onClick={handleCloseModal}>
                취소
              </Button>
              <Button onClick={handleCloseModal}>추가 완료</Button>
            </>
          }
        >
          <p style={{ color: 'var(--color-textLow)', fontSize: '1.4rem' }}>
            건물 등록 폼 (추후 구현)
          </p>
        </Modal>
      )}

      {modal?.type === 'edit' && (
        <Modal
          open
          onClose={handleCloseModal}
          title="건물 정보 수정"
          description={`'${modal.building.name}' 정보를 수정합니다`}
          footer={
            <>
              <Button variant="ghost" onClick={handleCloseModal}>
                취소
              </Button>
              <Button onClick={handleCloseModal}>수정 완료</Button>
            </>
          }
        >
          <p style={{ color: 'var(--color-textLow)', fontSize: '1.4rem' }}>
            건물 수정 폼 (추후 구현)
          </p>
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal
          variant="confirm"
          open
          onClose={handleCloseModal}
          title="건물 삭제"
          description={`정말로 '${modal.building.name}'을(를) 삭제하시겠습니까?`}
          warning="경고: 이 작업은 되돌릴 수 없습니다. 건물과 관련된 모든 도면 데이터가 영구적으로 삭제됩니다."
          footer={
            <>
              <Button variant="ghost" onClick={handleCloseModal}>
                취소
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                삭제
              </Button>
            </>
          }
        />
      )}
    </>
  );
};

export default BuildingsPage;
