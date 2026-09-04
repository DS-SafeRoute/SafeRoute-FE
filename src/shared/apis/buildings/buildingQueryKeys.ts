export const buildingQueryKeys = {
  all: ['buildings'] as const,
  lists: () => [...buildingQueryKeys.all, 'list'] as const,
  list: () => [...buildingQueryKeys.lists()] as const,
};
