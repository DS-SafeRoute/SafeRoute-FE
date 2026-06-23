import { useState } from 'react';

import PlusIcon from '@assets/icons/ic-plus.svg?react';

import { Button } from '@components/Button';
import ToastContainer from '@components/toast/ToastContainer';
import useToast from '@components/toast/useToast';

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
  const { toasts, leavingIds, show, dismiss } = useToast();

  const handleAdd = () => setModal({ type: 'add' });
  const handleEdit = (building: Building) => setModal({ type: 'edit', building });
  const handleDelete = (building: Building) => setModal({ type: 'delete', building });
  const handleFloorPlan = (building: Building) => setModal({ type: 'floorPlan', building });

  const handleUpdateFloorPlans = (
    buildingId: number,
    patch: Partial<Pick<Building, 'aboveFloors' | 'belowFloors' | 'floorPlans'>>,
  ) => {
    setBuildings((prev) => prev.map((b) => (b.id === buildingId ? { ...b, ...patch } : b)));
    if (
      patch.floorPlans !== undefined &&
      patch.aboveFloors === undefined &&
      patch.belowFloors === undefined
    ) {
      show({ title: '도면이 업데이트되었습니다.', variant: 'success' });
    }
  };

  const handleConfirmAdd = (building: Omit<Building, 'id'>) => {
    const newId = Math.max(0, ...buildings.map((b) => b.id)) + 1;
    setBuildings((prev) => [...prev, { id: newId, ...building }]);
    setModal(null);
    show({
      title: '건물이 추가되었습니다.',
      description: `${building.name}이(가) 등록되었습니다.`,
      variant: 'success',
    });
  };

  const handleConfirmEdit = (updated: Building) => {
    setBuildings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setModal(null);
    show({
      title: '건물 정보가 수정되었습니다.',
      description: `${updated.name} 정보가 업데이트되었습니다.`,
      variant: 'success',
    });
  };

  const handleConfirmDelete = () => {
    if (modal?.type !== 'delete') return;
    const { building } = modal;
    setBuildings((prev) => prev.filter((b) => b.id !== building.id));
    setModal(null);
    show({
      title: '건물이 삭제되었습니다.',
      description: `${building.name}이(가) 삭제되었습니다.`,
      variant: 'default',
    });
  };

  const handleCloseModal = () => setModal(null);

  return (
    <>
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

      <ToastContainer toasts={toasts} leavingIds={leavingIds} onClose={dismiss} />
    </>
  );
};

export default BuildingsPage;
