import { createFloor, deleteFloor, getBuildingFloors } from '@pages/floorPlans/api/floorPlansApi';
import type { Floor } from '@pages/floorPlans/types/floorPlans';

// 알려진 제약: 지상/지하 구분 필드가 아직 백엔드에 없어서, 지금은 1층~totalFloors를 전부 지상층으로
// 취급함. 백엔드에 필드 추가 요청해둔 상태(scratchpad/backend_questions.md #7) — 필드가 생기면
// 지상/지하 구간을 나눠서 층 번호를 매기는 방식으로 이 로직 전체를 다시 설계해야 함
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

// 새 건물 등록 시 1층~totalFloors 전부 빈 층으로 순차 생성 (병렬 생성 시 서버 쪽 순서 충돌 가능성 있음)
export async function createInitialFloors(buildingId: string, totalFloors: number): Promise<void> {
  for (let floorNum = 1; floorNum <= totalFloors; floorNum += 1) {
    await createFloor(buildingId, floorNum);
  }
}
