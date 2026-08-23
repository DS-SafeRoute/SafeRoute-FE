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
import FloorSyncWarningModal from './modals/FloorSyncWarningModal';
import { applyFloorSync, createInitialFloors, planFloorSync } from './utils/floorSync';

import type { Building } from './types/buildings';
import type { FloorSyncPlan } from './utils/floorSync';

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; building: Building }
  | { type: 'delete'; building: Building }
  | null;

type FloorSyncTarget = {
  buildingId: string;
  buildingName: string;
  body: UpdateBuildingRequest;
  plan: FloorSyncPlan;
};

const BuildingsPage = () => {
  const { data, isLoading, isError } = useGetBuildingsQuery();
  const createBuildingMutation = useCreateBuildingMutation();
  const updateBuildingMutation = useUpdateBuildingMutation();
  const deleteBuildingMutation = useDeleteBuildingMutation();
  const buildings = data ?? [];
  const [modal, setModal] = useState<ModalState>(null);
  const [floorSyncTarget, setFloorSyncTarget] = useState<FloorSyncTarget | null>(null);
  const [isPlanningFloorSync, setIsPlanningFloorSync] = useState(false);
  const [isApplyingFloorSync, setIsApplyingFloorSync] = useState(false);
  const { show } = useToast();

  const handleAdd = () => setModal({ type: 'add' });
  const handleEdit = (building: Building) => setModal({ type: 'edit', building });
  const handleDelete = (building: Building) => setModal({ type: 'delete', building });

  // 건물 층수 = 도면관리 실제 층 개수가 항상 일치해야 해서, 등록 시 1층~totalFloors를 바로 생성
  const handleConfirmAdd = (body: CreateBuildingRequest) => {
    createBuildingMutation.mutate(body, {
      onSuccess: (newBuilding) => {
        setModal(null);
        show({
          title: '건물이 추가되었습니다.',
          description: `${body.name}이(가) 등록되었습니다.`,
          variant: 'success',
        });
        createInitialFloors(newBuilding.id, body.totalFloors).catch(() => {
          show({ title: '층 목록 생성에 실패했습니다.', variant: 'error' });
        });
      },
      onError: () => {
        show({ title: '건물 추가에 실패했습니다.', variant: 'error' });
      },
    });
  };

  const runBuildingUpdate = (
    buildingId: string,
    body: UpdateBuildingRequest,
    plan: FloorSyncPlan,
  ) => {
    updateBuildingMutation.mutate(
      { buildingId, body },
      {
        onSuccess: () => {
          setModal(null);
          setFloorSyncTarget(null);
          setIsApplyingFloorSync(false);
          show({
            title: '건물 정보가 수정되었습니다.',
            description: `${body.name} 정보가 업데이트되었습니다.`,
            variant: 'success',
          });
          applyFloorSync(plan).catch(() => {
            show({ title: '층 목록 동기화에 실패했습니다.', variant: 'error' });
          });
        },
        onError: () => {
          setIsApplyingFloorSync(false);
          show({ title: '건물 수정에 실패했습니다.', variant: 'error' });
        },
      },
    );
  };

  // 층수를 줄이는 경우 기존 층에 도면 데이터가 있으면 먼저 경고 모달을 띄움
  const handleConfirmEdit = (body: UpdateBuildingRequest) => {
    if (modal?.type !== 'edit') return;
    const { building } = modal;
    setIsPlanningFloorSync(true);
    planFloorSync(building.id, body.totalFloors)
      .then((plan) => {
        setIsPlanningFloorSync(false);
        if (plan.hasDataLoss) {
          setModal(null);
          setFloorSyncTarget({ buildingId: building.id, buildingName: building.name, body, plan });
          return;
        }
        runBuildingUpdate(building.id, body, plan);
      })
      .catch(() => {
        setIsPlanningFloorSync(false);
        show({ title: '층 정보를 확인하지 못했습니다.', variant: 'error' });
      });
  };

  const handleConfirmFloorSyncWarning = () => {
    if (!floorSyncTarget) return;
    setIsApplyingFloorSync(true);
    runBuildingUpdate(floorSyncTarget.buildingId, floorSyncTarget.body, floorSyncTarget.plan);
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
          isSubmitting={isPlanningFloorSync || updateBuildingMutation.isPending}
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

      {floorSyncTarget && (
        <FloorSyncWarningModal
          open
          onClose={() => setFloorSyncTarget(null)}
          buildingName={floorSyncTarget.buildingName}
          floorsToDelete={floorSyncTarget.plan.toDeleteFloors}
          onConfirm={handleConfirmFloorSyncWarning}
          isSubmitting={isApplyingFloorSync}
        />
      )}
    </>
  );
};

export default BuildingsPage;
