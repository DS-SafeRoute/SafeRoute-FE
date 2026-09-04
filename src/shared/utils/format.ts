export const formatDuration = (seconds = 0) => {
  const total = Math.max(0, Math.round(seconds));

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

// CCTV 감시 면적(㎡) 등 그리드 칸 수 × 칸 크기로 계산되는 값은 부동소수점 연산 특성상
// "51.839999999999996" 같은 오차가 그대로 노출될 수 있어 소수 둘째 자리로 반올림함.
// Number.EPSILON 보정 없이 Math.round(areaM2*100)만 쓰면 1.005*100이 부동소수점상
// 100.49999999999999가 되어 1(반올림 전)로 잘못 내려가는 경우가 생겨 보정을 더함
export const formatAreaM2 = (areaM2: number) => {
  const rounded = Math.round((areaM2 + Number.EPSILON) * 100) / 100;
  return rounded.toString();
};

export const formatDate = (iso?: string | null) => {
  if (!iso) return '-';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
};
