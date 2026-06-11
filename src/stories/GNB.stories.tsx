import { MemoryRouter } from 'react-router';

import GNB from '@components/gnb';
import Sidebar from '@components/sideBar/Sidebar';

import { sidebarItems } from '@constants/sidebar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/GNB',
  component: GNB,
  parameters: { layout: 'fullscreen' },
  args: {
    breadcrumbs: [{ label: '훈련 관리' }],
    title: '건물 관리',
    description: '등록된 건물과 시설을 관리합니다',
    userName: '김안전',
    userRole: '관리자',
  },
} satisfies Meta<typeof GNB>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {},
};

const PageLayout = ({
  initialPath,
  breadcrumbs,
  title,
  description,
}: {
  initialPath: string;
  breadcrumbs?: { label: string }[];
  title: string;
  description?: string;
}) => (
  <MemoryRouter initialEntries={[initialPath]}>
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F9FAFB' }}>
      <Sidebar brand="SAFE ROUTE" menuItems={sidebarItems} />
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
        <GNB
          breadcrumbs={breadcrumbs}
          title={title}
          description={description}
          userName="김안전"
          userRole="관리자"
        />
        <main style={{ flex: 1, padding: '2.4rem 3.2rem', overflowY: 'auto' }} />
      </div>
    </div>
  </MemoryRouter>
);

export const ReferenceSet: Story = {
  args: {},
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: '#E5E7EB' }}
    >
      <PageLayout
        initialPath="/buildings"
        breadcrumbs={[{ label: '관리' }]}
        title="건물 관리"
        description="등록된 건물과 시설을 관리합니다"
      />
      <PageLayout
        initialPath="/floorPlans"
        breadcrumbs={[{ label: '관리' }, { label: '건물 관리' }]}
        title="도면 관리"
        description="각 층별 도면을 업로드하고 관리합니다"
      />
    </div>
  ),
};
