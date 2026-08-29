import { createFloor, deleteFloor, getBuildingFloors } from '@pages/floorPlans/api/floorPlansApi';
import type { Floor } from '@pages/floorPlans/types/floorPlans';

// 지상층은 1, 2, 3...(양수), 지하층은 -1, -2, -3...(음수)로 번호를 매김 — 도면관리의
// formatFloor(src/shared/utils/floor.ts)가 이미 이 규칙을 전제로 "3층"/"B1층"을 표시하고 있음
export interface FloorCounts {
  aboveFloors: number;
  belowFloors: number;
}

export interface FloorSyncPlan {
  buildingId: string;
  toCreateFloorNums: number[];
  toDeleteFloors: Floor[];
  hasDataLoss: boolean;
}

const floorNumsForCounts = ({ aboveFloors, belowFloors }: FloorCounts): number[] => {
  const nums: number[] = [];
  for (let n = 1; n <= aboveFloors; n += 1) nums.push(n);
  for (let n = 1; n <= belowFloors; n += 1) nums.push(-n);
  return nums;
};

// 건물의 지상/지하 층수를 target에 맞추기 위해 어떤 층을 새로 만들고 어떤 층을 지워야 하는지 계산
export async function planFloorSync(
  buildingId: string,
  target: FloorCounts,
): Promise<FloorSyncPlan> {
  const floors = await getBuildingFloors(buildingId);
  const existingFloorNums = new Set(floors.map((f) => f.floorNum));
  const targetFloorNums = floorNumsForCounts(target);
  const targetFloorNumSet = new Set(targetFloorNums);

  const toCreateFloorNums = targetFloorNums.filter((n) => !existingFloorNums.has(n));
  const toDeleteFloors = floors.filter((f) => !targetFloorNumSet.has(f.floorNum));
  // segmentationStatus는 백엔드에 'NONE'이 없어서 항상 무언가 값이 채워져 있음 — 실제로 도면이
  // 업로드됐는지는 mapImageUrl 유무로만 판단해야 함(이걸 안 쓰면 빈 층도 전부 데이터 있음으로 오판)
  const hasDataLoss = toDeleteFloors.some((f) => !!f.mapImageUrl);

  return { buildingId, toCreateFloorNums, toDeleteFloors, hasDataLoss };
}

export async function applyFloorSync(plan: FloorSyncPlan): Promise<void> {
  // 층을 동시에 병렬 생성하면 서버 쪽에서 순서를 보장 못 해 실패할 수 있어 순차로 생성
  for (const floorNum of plan.toCreateFloorNums) {
    await createFloor(plan.buildingId, floorNum);
  }
  await Promise.all(plan.toDeleteFloors.map((floor) => deleteFloor(plan.buildingId, floor.id)));
}

// 새 건물 등록 시 지상/지하 층을 전부 빈 층으로 순차 생성 (병렬 생성 시 서버 쪽 순서 충돌 가능성 있음)
export async function createInitialFloors(buildingId: string, counts: FloorCounts): Promise<void> {
  for (const floorNum of floorNumsForCounts(counts)) {
    await createFloor(buildingId, floorNum);
  }
}
