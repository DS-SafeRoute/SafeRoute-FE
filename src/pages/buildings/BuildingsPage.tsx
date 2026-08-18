import { useState } from 'react';

import type {
  CreateBuildingRequest,
  UpdateBuildingRequest,
} from '@apis/__generated__/data-contracts';

import PlusIcon from '@assets/icons/ic-plus.svg?react';

import { Button } from '@components/Button';
import useToast from '@components/toast/useToast';

import { useGetBuildingsQuery } from './api/useBuildingsQuery';
import { useCreateBuildingMutation } from './api/useCreateBuildingMutation';
import { useDeleteBuildingMutation } from './api/useDeleteBuildingMutation';
import { useUpdateBuildingMutation } from './api/useUpdateBuildingMutation';
import * as styles from './BuildingsPage.css';
import BuildingCard from './components/BuildingCard/BuildingCard';
import OrganizationCard from './components/OrganizationCard/OrganizationCard';
import { mockOrganization } from './mocks/buildingsData';
import BuildingAddModal from './modals/BuildingAddModal';
import BuildingDeleteModal from './modals/BuildingDeleteModal';
import BuildingEditModal from './modals/BuildingEditModal';

import type { Building } from './types/buildings';

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; building: Building }
  | { type: 'delete'; building: Building }
  | null;

const BuildingsPage = () => {
  const { data, isLoading, isError } = useGetBuildingsQuery();
  const createBuildingMutation = useCreateBuildingMutation();
  const updateBuildingMutation = useUpdateBuildingMutation();
  const deleteBuildingMutation = useDeleteBuildingMutation();
  const buildings = data ?? [];
  const [modal, setModal] = useState<ModalState>(null);
  const { show } = useToast();

  const handleAdd = () => setModal({ type: 'add' });
  const handleEdit = (building: Building) => setModal({ type: 'edit', building });
  const handleDelete = (building: Building) => setModal({ type: 'delete', building });

  const handleConfirmAdd = (body: CreateBuildingRequest) => {
    createBuildingMutation.mutate(body, {
      onSuccess: () => {
        setModal(null);
        show({
          title: '건물이 추가되었습니다.',
          description: `${body.name}이(가) 등록되었습니다.`,
          variant: 'success',
        });
      },
      onError: () => {
        show({ title: '건물 추가에 실패했습니다.', variant: 'error' });
      },
    });
  };

  const handleConfirmEdit = (body: UpdateBuildingRequest) => {
    if (modal?.type !== 'edit') return;
    const { building } = modal;
    updateBuildingMutation.mutate(
      { buildingId: building.id, body },
      {
        onSuccess: () => {
          setModal(null);
          show({
            title: '건물 정보가 수정되었습니다.',
            description: `${body.name} 정보가 업데이트되었습니다.`,
            variant: 'success',
          });
        },
        onError: () => {
          show({ title: '건물 수정에 실패했습니다.', variant: 'error' });
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (modal?.type !== 'delete') return;
    const { building } = modal;
    deleteBuildingMutation.mutate(building.id, {
      onSuccess: () => {
        setModal(null);
        show({
          title: '건물이 삭제되었습니다.',
          description: `${building.name}이(가) 삭제되었습니다.`,
          variant: 'default',
        });
      },
      onError: () => {
        show({ title: '건물 삭제에 실패했습니다.', variant: 'error' });
      },
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

        {isLoading && <p className={styles.stateMessage}>불러오는 중...</p>}

        {isError && <p className={styles.errorMessage}>건물 목록을 불러오지 못했습니다.</p>}

        {!isLoading && !isError && buildings.length === 0 && (
          <p className={styles.stateMessage}>등록된 건물이 없습니다.</p>
        )}

        {!isLoading && !isError && buildings.length > 0 && (
          <div className={styles.grid}>
            {buildings.map((building) => (
              <BuildingCard
                key={building.id}
                building={building}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {modal?.type === 'add' && (
        <BuildingAddModal
          open
          onClose={handleCloseModal}
          onConfirm={handleConfirmAdd}
          isSubmitting={createBuildingMutation.isPending}
        />
      )}

      {modal?.type === 'edit' && (
        <BuildingEditModal
          open
          onClose={handleCloseModal}
          building={modal.building}
          onConfirm={handleConfirmEdit}
          isSubmitting={updateBuildingMutation.isPending}
        />
      )}

      {modal?.type === 'delete' && (
        <BuildingDeleteModal
          open
          onClose={handleCloseModal}
          building={modal.building}
          onConfirm={handleConfirmDelete}
          isSubmitting={deleteBuildingMutation.isPending}
        />
      )}
    </>
  );
};

export default BuildingsPage;
