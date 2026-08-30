import * as styles from './FireLocationGrid.css';

const GRID_ROW_COUNT = 4;
const GRID_COLUMN_COUNT = 10;
const GRID_CELL_COUNT = GRID_ROW_COUNT * GRID_COLUMN_COUNT;

interface FireLocationGridProps {
  selectedCellIndex: number | null;
  readOnly: boolean;
  onSelect: (cellIndex: number) => void;
}

const FireLocationGrid = ({ selectedCellIndex, readOnly, onSelect }: FireLocationGridProps) => (
  <div className={styles.panel}>
    <div className={styles.grid} aria-label="발화 위치 선택 격자">
      {Array.from({ length: GRID_CELL_COUNT }, (_, cellIndex) => {
        const isSelected = selectedCellIndex === cellIndex;
        const row = Math.floor(cellIndex / GRID_COLUMN_COUNT) + 1;
        const column = (cellIndex % GRID_COLUMN_COUNT) + 1;

        return (
          <button
            key={cellIndex}
            type="button"
            className={isSelected ? styles.selectedCell : styles.cell}
            aria-label={`${row}행 ${column}열${isSelected ? ', 발화 위치' : ''}`}
            aria-pressed={isSelected}
            disabled={readOnly}
            onClick={() => onSelect(cellIndex)}
          >
            {isSelected ? (
              <span className={styles.fireMarker}>
                <span className={styles.fireIcon} aria-hidden="true">
                  🔥
                </span>
                <span>발화점</span>
              </span>
            ) : null}
          </button>
        );
      })}
    </div>

    {selectedCellIndex === null && readOnly ? (
      <p className={styles.emptyMessage}>발화 위치 정보 없음</p>
    ) : null}
  </div>
);

export default FireLocationGrid;
