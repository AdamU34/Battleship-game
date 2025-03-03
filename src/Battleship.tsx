import { memo } from 'react';
import useBattleshipGame, { SHIP_LAYOUT, type Ship } from './useBattleship';
import './Battleship.css';

const GRID_SIZE = 10;

type ShipInfo = {
  name: Ship;
  size: number;
};

const SHIPS: ShipInfo[] = [
  { name: 'carrier', size: 5 },
  { name: 'battleship', size: 4 },
  { name: 'cruiser', size: 3 },
  { name: 'submarine', size: 3 },
  { name: 'destroyer', size: 2 },
];

const Scoreboard = memo(
  ({
    player1Score,
    player2Score = 0,
  }: {
    player1Score: number;
    player2Score?: number;
  }) => (
    <div className="scoreboard">
      <div className="player player1">
        <span className="score">{String(player1Score).padStart(2, '0')}</span>
        <span className="label">player 1</span>
      </div>
      <div className="player player2">
        <span className="score">{String(player2Score).padStart(2, '0')}</span>
        <span className="label">player 2</span>
      </div>
    </div>
  )
);

const ShipIndicator = memo(
  ({ name, size, hits }: { name: Ship; size: number; hits: number }) => (
    <div className="ship-row">
      <div className={`ship ${name}`} />
      <div className="ship-indicators">
        {Array.from({ length: size }).map((_, i) => (
          <div key={i} className={`indicator ${i < hits ? 'hit' : ''}`} />
        ))}
      </div>
    </div>
  )
);

const GridCell = memo(
  ({
    isHit,
    isMiss,
    onClick,
  }: {
    isHit: boolean;
    isMiss: boolean;
    onClick: () => void;
  }) => (
    <div
      className={`cell ${isHit ? 'hit' : ''} ${isMiss ? 'miss' : ''}`}
      onClick={onClick}
    />
  )
);

const Battleship = () => {
  const { hits, misses, handleCellClick, score } = useBattleshipGame();

  const getShipHits = (shipName: Ship): number => {
    const shipPositions = SHIP_LAYOUT[shipName].positions;
    return shipPositions.filter(([r, c]) =>
      hits.some(([hr, hc]) => hr === r && hc === c)
    ).length;
  };

  return (
    <div className="battleship-container">
      <div className="board-container">
        <Scoreboard player1Score={score} />

        <div className="ship-status">
          {SHIPS.map((ship) => (
            <ShipIndicator
              key={ship.name}
              name={ship.name}
              size={ship.size}
              hits={getShipHits(ship.name)}
            />
          ))}
        </div>
      </div>

      <div className="grid-container">
        <div className="grid">
          {Array.from({ length: GRID_SIZE }).map((_, row) =>
            Array.from({ length: GRID_SIZE }).map((_, col) => {
              const isHit = hits.some(([r, c]) => r === row && c === col);
              const isMiss = misses.some(([r, c]) => r === row && c === col);
              return (
                <GridCell
                  key={`${row}-${col}`}
                  isHit={isHit}
                  isMiss={isMiss}
                  onClick={() => handleCellClick(row, col)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Battleship;
