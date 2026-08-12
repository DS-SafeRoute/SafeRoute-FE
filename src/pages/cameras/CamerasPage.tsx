import { useMemo, useState } from 'react';

import PlusIcon from '@assets/icons/ic-plus.svg?react';

import { Button } from '@components/Button';
import FilterChip from '@components/chip/FilterChip';
import useToast from '@components/toast/useToast';

import * as styles from './CamerasPage.css';
import CameraCard from './components/CameraCard/CameraCard';
import { mockCameras } from './mocks/camerasData';
import CameraDeleteModal from './modals/CameraDeleteModal';
import CameraFormModal from './modals/CameraFormModal';
import { mockBuildings } from '../buildings/mocks/buildingsData';

import type { Camera } from './types/cameras';

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; camera: Camera }
  | { type: 'delete'; camera: Camera }
  | null;

const ALL = '전체';

const CamerasPage = () => {
  const [cameras, setCameras] = useState<Camera[]>(mockCameras);
  const [modal, setModal] = useState<ModalState>(null);
  const [filterBuilding, setFilterBuilding] = useState(ALL);
  const { show } = useToast();

  const buildingOptions = useMemo(() => {
    const names = [...new Set(cameras.map((c) => c.buildingName))];
    return [ALL, ...names];
  }, [cameras]);

  const filtered = useMemo(
    () => cameras.filter((c) => filterBuilding === ALL || c.buildingName === filterBuilding),
    [cameras, filterBuilding],
  );

  const handleConfirmAdd = (data: Omit<Camera, 'id' | 'status'>) => {
    const newId = Math.max(0, ...cameras.map((c) => c.id)) + 1;
    setCameras((prev) => [...prev, { id: newId, status: 'online', ...data }]);
    setModal(null);
    show({
      title: '카메라가 추가되었습니다.',
      description: `${data.name}이(가) 등록되었습니다.`,
      variant: 'success',
    });
  };

  const handleConfirmEdit = (data: Omit<Camera, 'id' | 'status'>) => {
    if (modal?.type !== 'edit') return;
    const updated: Camera = { ...modal.camera, ...data };
    setCameras((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setModal(null);
    show({
      title: '카메라 정보가 수정되었습니다.',
      description: `${updated.name} 정보가 업데이트되었습니다.`,
      variant: 'success',
    });
  };

  const handleToggleActive = (camera: Camera) => {
    setCameras((prev) =>
      prev.map((c) => (c.id === camera.id ? { ...c, isActive: !c.isActive } : c)),
    );
    show({
      title: camera.isActive ? '카메라가 비활성화되었습니다.' : '카메라가 활성화되었습니다.',
      description: `${camera.name}이(가) ${camera.isActive ? '비활성' : '활성'} 상태로 변경되었습니다.`,
      variant: 'default',
    });
  };

  const handleConfirmDelete = () => {
    if (modal?.type !== 'delete') return;
    const { camera } = modal;
    setCameras((prev) => prev.filter((c) => c.id !== camera.id));
    setModal(null);
    show({
      title: '카메라가 삭제되었습니다.',
      description: `${camera.name}이(가) 삭제되었습니다.`,
      variant: 'default',
    });
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.filterRow}>
          {buildingOptions.map((name) => (
            <FilterChip
              key={name}
              label={name}
              selected={filterBuilding === name}
              onSelect={() => setFilterBuilding(name)}
            />
          ))}
        </div>

        <div className={styles.listHeader}>
          <span className={styles.listCount}>총 {filtered.length}개 카메라</span>
          <Button onClick={() => setModal({ type: 'add' })}>
            <PlusIcon width={16} height={16} />
            카메라 추가
          </Button>
        </div>

        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((camera) => (
              <CameraCard
                key={camera.id}
                camera={camera}
                onEdit={(c) => setModal({ type: 'edit', camera: c })}
                onDelete={(c) => setModal({ type: 'delete', camera: c })}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span>등록된 카메라가 없습니다</span>
          </div>
        )}
      </div>

      {modal?.type === 'add' && (
        <CameraFormModal
          open
          onClose={() => setModal(null)}
          buildings={mockBuildings}
          onConfirm={handleConfirmAdd}
        />
      )}

      {modal?.type === 'edit' && (
        <CameraFormModal
          open
          onClose={() => setModal(null)}
          camera={modal.camera}
          buildings={mockBuildings}
          onConfirm={handleConfirmEdit}
        />
      )}

      {modal?.type === 'delete' && (
        <CameraDeleteModal
          open
          onClose={() => setModal(null)}
          camera={modal.camera}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
};

export default CamerasPage;
