export const formatDuration = (seconds = 0) => {
  const total = Math.max(0, Math.round(seconds));

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

export const formatDate = (iso?: string | null) => {
  if (!iso) return '-';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
};
