import { createFloor, deleteFloor, getBuildingFloors } from '@pages/floorPlans/api/floorPlansApi';
import type { Floor } from '@pages/floorPlans/types/floorPlans';

// TODO: 지상/지하 층수가 백엔드에 별도 필드로 추가되면, 지금은 1층~totalFloors를 전부 지상층으로
// 취급하는 이 로직을 지상/지하 구간을 나눠서 층 번호를 매기는 방식으로 고쳐야 함
export interface FloorSyncPlan {
  buildingId: string;
  toCreateFloorNums: number[];
  toDeleteFloors: Floor[];
  hasDataLoss: boolean;
}

// 건물의 층수를 targetTotalFloors로 맞추기 위해 어떤 층을 새로 만들고 어떤 층을 지워야 하는지 계산
export async function planFloorSync(
  buildingId: string,
  targetTotalFloors: number,
): Promise<FloorSyncPlan> {
  const floors = await getBuildingFloors(buildingId);
  const existingFloorNums = new Set(floors.map((f) => f.floorNum));

  const toCreateFloorNums: number[] = [];
  for (let floorNum = 1; floorNum <= targetTotalFloors; floorNum += 1) {
    if (!existingFloorNums.has(floorNum)) toCreateFloorNums.push(floorNum);
  }

  const toDeleteFloors = floors.filter((f) => f.floorNum > targetTotalFloors);
  const hasDataLoss = toDeleteFloors.some((f) => f.segmentationStatus !== 'NONE');

  return { buildingId, toCreateFloorNums, toDeleteFloors, hasDataLoss };
}

export async function applyFloorSync(plan: FloorSyncPlan): Promise<void> {
  await Promise.all(
    plan.toCreateFloorNums.map((floorNum) => createFloor(plan.buildingId, floorNum)),
  );
  await Promise.all(plan.toDeleteFloors.map((floor) => deleteFloor(plan.buildingId, floor.id)));
}

// 새 건물 등록 시 1층~totalFloors 전부 빈 층으로 생성
export async function createInitialFloors(buildingId: string, totalFloors: number): Promise<void> {
  const floorNums = Array.from({ length: totalFloors }, (_, i) => i + 1);
  await Promise.all(floorNums.map((floorNum) => createFloor(buildingId, floorNum)));
}
