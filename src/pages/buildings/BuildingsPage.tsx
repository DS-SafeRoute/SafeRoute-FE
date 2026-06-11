import { useState } from 'react';

import PlusIcon from '@assets/icons/ic-plus.svg?react';

import { Button } from '@components/Button';
import GNB from '@components/gnb';

import * as styles from './BuildingsPage.css';
import BuildingCard from './components/BuildingCard/BuildingCard';
import OrganizationCard from './components/OrganizationCard/OrganizationCard';
import { mockBuildings, mockOrganization } from './mocks/buildingsData';
import BuildingAddModal from './modals/BuildingAddModal';
import BuildingDeleteModal from './modals/BuildingDeleteModal';
import BuildingEditModal from './modals/BuildingEditModal';
import FloorPlanModal from './modals/FloorPlanModal';

import type { Building } from './types/buildings';

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; building: Building }
  | { type: 'delete'; building: Building }
  | { type: 'floorPlan'; building: Building }
  | null;

const BuildingsPage = () => {
  const [buildings, setBuildings] = useState<Building[]>(mockBuildings);
  const [modal, setModal] = useState<ModalState>(null);

  const handleAdd = () => setModal({ type: 'add' });
  const handleEdit = (building: Building) => setModal({ type: 'edit', building });
  const handleDelete = (building: Building) => setModal({ type: 'delete', building });
  const handleFloorPlan = (building: Building) => setModal({ type: 'floorPlan', building });

  const handleUpdateFloorPlans = (
    buildingId: number,
    patch: Partial<Pick<Building, 'aboveFloors' | 'belowFloors' | 'floorPlans'>>,
  ) => {
    setBuildings((prev) => prev.map((b) => (b.id === buildingId ? { ...b, ...patch } : b)));
  };

  const handleConfirmAdd = (building: Omit<Building, 'id'>) => {
    const newId = Math.max(0, ...buildings.map((b) => b.id)) + 1;
    setBuildings((prev) => [...prev, { id: newId, ...building }]);
    setModal(null);
  };

  const handleConfirmEdit = (updated: Building) => {
    setBuildings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setModal(null);
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
        <BuildingAddModal open onClose={handleCloseModal} onConfirm={handleConfirmAdd} />
      )}

      {modal?.type === 'edit' && (
        <BuildingEditModal
          open
          onClose={handleCloseModal}
          building={modal.building}
          onConfirm={handleConfirmEdit}
        />
      )}

      {modal?.type === 'delete' && (
        <BuildingDeleteModal
          open
          onClose={handleCloseModal}
          building={modal.building}
          onConfirm={handleConfirmDelete}
        />
      )}

      {modal?.type === 'floorPlan' && (
        <FloorPlanModal
          open
          onClose={handleCloseModal}
          building={modal.building}
          onUpdate={handleUpdateFloorPlans}
        />
      )}
    </>
  );
};

export default BuildingsPage;
