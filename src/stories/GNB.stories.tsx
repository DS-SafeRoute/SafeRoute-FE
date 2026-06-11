import GNB from '@components/gnb';

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

export const ReferenceSet: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#F9FAFB' }}>
      <div style={{ display: 'grid', gap: '0' }}>
        <span style={{ padding: '12px 32px', fontSize: '12px', color: '#9CA3AF' }}>
          건물 관리 (breadcrumb + description)
        </span>
        <GNB
          breadcrumbs={[{ label: '훈련 관리' }]}
          title="건물 관리"
          description="등록된 건물과 시설을 관리합니다"
          userName="김안전"
          userRole="관리자"
        />
      </div>
      <div style={{ display: 'grid', gap: '0' }}>
        <span style={{ padding: '12px 32px', fontSize: '12px', color: '#9CA3AF' }}>
          도면 관리 (중첩 breadcrumb)
        </span>
        <GNB
          breadcrumbs={[{ label: '훈련 관리' }, { label: '건물 관리' }]}
          title="도면 관리"
          description="각 층별 도면을 업로드하고 관리합니다"
          userName="김안전"
          userRole="관리자"
        />
      </div>
      <div style={{ display: 'grid', gap: '0' }}>
        <span style={{ padding: '12px 32px', fontSize: '12px', color: '#9CA3AF' }}>설명 없음</span>
        <GNB title="카메라 관리" userName="김안전" userRole="관리자" />
      </div>
    </div>
  ),
};
