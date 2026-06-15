export const formatFloor = (n: number): string => {
  if (n > 0) return `${n}층`;
  if (n < 0) return `B${Math.abs(n)}층`;
  return 'B1층';
};
