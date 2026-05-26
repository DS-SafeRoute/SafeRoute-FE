import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import FilterChip from '../shared/components/chip/FilterChip';

const meta = {
  title: 'Shared/Chip/FilterChip',
  component: FilterChip,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: '이번 주',
    selected: false,
    disabled: false,
  },
} satisfies Meta<typeof FilterChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ReferenceSet: Story = {
  render: () => {
    const Preview = () => {
      const [selectedWeek, setSelectedWeek] = useState(true);
      const [selectedMonth, setSelectedMonth] = useState(false);
      const [filters, setFilters] = useState(['A동 · 3층', '완료됨']);

      return (
        <div
          style={{
            width: '1280px',
            padding: '48px',
            borderRadius: '32px',
            backgroundColor: '#FFFFFF',
            display: 'grid',
            gap: '24px',
          }}
        >
          <span style={{ fontSize: '14px', color: '#4A5563' }}>FILTER CHIPS</span>
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
      );
    };

    return <Preview />;
  },
};
