import useBattleshipGame, { SHIP_LAYOUT } from './useBattleship';
import './Battleship.css';

const GRID_SIZE = 10;

interface ShipInfo {
  name: string;
  size: number;
}

const SHIPS: ShipInfo[] = [
  { name: 'carrier', size: 5 },
  { name: 'battleship', size: 4 },
  { name: 'cruiser', size: 3 },
  { name: 'submarine', size: 3 },
  { name: 'destroyer', size: 2 },
];

const Battleship = () => {
  const { hits, misses, handleCellClick, score } = useBattleshipGame();

  const getShipHits = (shipName: string): number => {
    const shipPositions = SHIP_LAYOUT[shipName].positions;
    return shipPositions.filter(([r, c]) =>
      hits.some(([hr, hc]) => hr === r && hc === c)
    ).length;
  };

  return (
    <div className="battleship-container">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Scoreboard */}
        <div className="scoreboard">
          <div className="player player1">
            <span className="score">{String(score).padStart(2, '0')}</span>
            <span className="label">player 1</span>
          </div>
          <div className="player player2">
            <span className="score">00</span>
            <span className="label">player 2</span>
          </div>
        </div>

        {/* Ship Status */}
        <div className="ship-status">
          {SHIPS.map((ship) => (
            <div key={ship.name} className="ship-row">
              <div className={`ship ${ship.name}`} />
              <div className="ship-indicators">
                {Array.from({ length: ship.size }).map((_, i) => (
                  <div
                    key={i}
                    className={`indicator ${
                      i < getShipHits(ship.name) ? 'hit' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid-container">
        <div className="grid">
          {Array.from({ length: GRID_SIZE }).map((_, row) =>
            Array.from({ length: GRID_SIZE }).map((_, col) => {
              const isHit = hits.some(([r, c]) => r === row && c === col);
              const isMiss = misses.some(([r, c]) => r === row && c === col);
              return (
                <div
                  key={`${row}-${col}`}
                  className={`cell ${isHit ? 'hit' : ''} ${
                    isMiss ? 'miss' : ''
                  }`}
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
