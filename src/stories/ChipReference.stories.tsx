import { useState } from 'react';

import FilterChip from '@components/chip/FilterChip';
import StatusBadge from '@components/chip/StatusBadge';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/Chip/Reference',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  render: () => {
    const ReferencePreview = () => {
      const [selectedWeek, setSelectedWeek] = useState(true);
      const [selectedMonth, setSelectedMonth] = useState(false);
      const [filters, setFilters] = useState(['A동 · 3층', '완료됨']);

      return (
        <div
          style={{
            minHeight: '100vh',
            padding: '28px 16px',
            background: '#F5F7FB',
          }}
        >
          <div
            style={{
              maxWidth: '1566px',
              margin: '0 auto',
              padding: '52px 46px',
              borderRadius: '32px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
              display: 'grid',
              gap: '30px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '320px 1fr',
                alignItems: 'center',
                gap: '24px',
                paddingBottom: '30px',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <span style={{ fontSize: '26px', letterSpacing: '0.12em', color: '#4B5563' }}>
                SOLID BADGES
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <StatusBadge label="대기" color="neutral" />
                <StatusBadge label="진행중" color="blue" />
                <StatusBadge label="완료" color="green" />
                <StatusBadge label="주의" color="yellow" />
                <StatusBadge label="위험" color="red" />
                <StatusBadge label="CCTV" color="purple" />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '320px 1fr',
                alignItems: 'center',
                gap: '24px',
                paddingBottom: '30px',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <span style={{ fontSize: '26px', letterSpacing: '0.12em', color: '#4B5563' }}>
                WITH DOT
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <StatusBadge label="정상 운영" color="green" dot />
                <StatusBadge label="점검 필요" color="yellow" dot />
                <StatusBadge label="오프라인" color="red" dot />
                <StatusBadge label="훈련중" color="blue" dot />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '320px 1fr',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <span style={{ fontSize: '26px', letterSpacing: '0.12em', color: '#4B5563' }}>
                FILTER CHIPS
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <FilterChip label="전체" onSelect={() => undefined} />
                <FilterChip
                  label="이번 주"
                  selected={selectedWeek}
                  onSelect={() => setSelectedWeek((prev) => !prev)}
                />
                <FilterChip
                  label="이번 달"
                  selected={selectedMonth}
                  onSelect={() => setSelectedMonth((prev) => !prev)}
                />
                {filters.map((filter) => (
                  <FilterChip
                    key={filter}
                    label={filter}
                    onRemove={() => setFilters((prev) => prev.filter((item) => item !== filter))}
                    removeLabel={`${filter} 필터 제거`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    };

    return <ReferencePreview />;
  },
};
