import { useEffect, useState } from 'react';

import type { CreateBuildingRequest } from '@apis/__generated__/data-contracts';

import PlusIcon from '@assets/icons/ic-plus.svg?react';

import { Button } from '@components/Button';
import useToast from '@components/toast/useToast';

import { useBuildingsQuery } from './api/useBuildingsQuery';
import { useCreateBuildingMutation } from './api/useCreateBuildingMutation';
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
  const { data, isLoading, isError } = useBuildingsQuery();
  const createBuildingMutation = useCreateBuildingMutation();
  // 수정/삭제는 아직 실 API로 안 붙어서, 응답 도착 시 로컬 상태로 복사해두고 그 위에서 낙관적으로 반영함
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const { show } = useToast();

  useEffect(() => {
    if (data) setBuildings(data);
  }, [data]);

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

        {isLoading && (
          <p style={{ color: 'var(--color-textLow)', fontSize: '1.4rem', padding: '2rem 0' }}>
            불러오는 중...
          </p>
        )}

        {isError && (
          <p style={{ color: 'var(--color-danger)', fontSize: '1.4rem', padding: '2rem 0' }}>
            건물 목록을 불러오지 못했습니다.
          </p>
        )}

        {!isLoading && !isError && (
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
    </>
  );
};

export default BuildingsPage;
