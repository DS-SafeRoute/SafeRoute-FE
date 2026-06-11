import type { Building, Organization } from '../types/buildings';

export const mockOrganization: Organization = {
  id: 1,
  name: '서울중학교',
  address: '서울특별시 강남구 테헤란로 123',
  registeredAt: '2024-03-01',
  isRepresentative: true,
};

export const mockBuildings: Building[] = [
  {
    id: 1,
    name: 'A동 본관',
    status: 'normal',
    lastTrainingDate: '2025-05-12',
    totalFloors: 5,
    cctvTotal: 12,
    cctvOnline: 12,
    iotTotal: 24,
    iotOnline: 24,
  },
  {
    id: 2,
    name: 'B동 별관',
    status: 'normal',
    lastTrainingDate: '2025-05-12',
    totalFloors: 3,
    cctvTotal: 6,
    cctvOnline: 6,
    iotTotal: 12,
    iotOnline: 12,
  },
  {
    id: 3,
    name: 'C동 체육관',
    status: 'warning',
    lastTrainingDate: '2025-04-20',
    totalFloors: 2,
    cctvTotal: 8,
    cctvOnline: 6,
    iotTotal: 16,
    iotOnline: 14,
  },
  {
    id: 4,
    name: 'D동 강당',
    status: 'normal',
    lastTrainingDate: '2025-05-01',
    totalFloors: 1,
    cctvTotal: 4,
    cctvOnline: 4,
    iotTotal: 8,
    iotOnline: 8,
  },
];
