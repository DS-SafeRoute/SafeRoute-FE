export const isPositiveNumber = (v: string) => /^\d+(\.\d+)?$/.test(v.trim()) && Number(v) > 0;

export const isPositiveInt = (v: string) => /^\d+$/.test(v.trim()) && Number(v) > 0;

export const isNonNegativeInt = (v: string) => /^\d+$/.test(v.trim()) && Number(v) >= 0;
