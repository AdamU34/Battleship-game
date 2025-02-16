import { useState } from 'react';

type Position = [number, number];
type Ship = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';

interface ShipLayout {
  size: number;
  positions: Position[];
}

interface ShipLayouts {
  [key: string]: ShipLayout;
}

export const SHIP_LAYOUT: ShipLayouts = {
  carrier: {
    size: 5,
    positions: [
      [2, 9],
      [3, 9],
      [4, 9],
      [5, 9],
      [6, 9],
    ],
  },
  battleship: {
    size: 4,
    positions: [
      [5, 2],
      [5, 3],
      [5, 4],
      [5, 5],
    ],
  },
  cruiser: {
    size: 3,
    positions: [
      [8, 1],
      [8, 2],
      [8, 3],
    ],
  },
  submarine: {
    size: 3,
    positions: [
      [3, 0],
      [3, 1],
      [3, 2],
    ],
  },
  destroyer: {
    size: 2,
    positions: [
      [0, 0],
      [1, 0],
    ],
  },
};

const useBattleshipGame = () => {
  const [hits, setHits] = useState<Position[]>([]);
  const [misses, setMisses] = useState<Position[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [sunkShips, setSunkShips] = useState<Record<Ship, boolean>>({
    carrier: false,
    battleship: false,
    cruiser: false,
    submarine: false,
    destroyer: false,
  });
  const [score, setScore] = useState<number>(0);
  const [lastHitShip, setLastHitShip] = useState<Ship | null>(null);

  const isPositionTaken = (row: number, col: number): boolean => {
    return (
      hits.some(([r, c]) => r === row && c === col) ||
      misses.some(([r, c]) => r === row && c === col)
    );
  };

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || isPositionTaken(row, col)) return;

    let hitShip: Ship | null = null;
    const isHit = Object.entries(SHIP_LAYOUT).some(
      ([shipName, { positions }]) => {
        const hit = positions.some(([r, c]) => r === row && c === col);
        if (hit) {
          hitShip = shipName as Ship;
        }
        return hit;
      }
    );

    if (isHit && hitShip) {
      setHits((prev) => [...prev, [row, col]]);
      setScore((prev) => prev + 100);
      setLastHitShip(hitShip);
    } else {
      setMisses((prev) => [...prev, [row, col]]);
      setScore((prev) => Math.max(0, prev - 10));
      setLastHitShip(null);
    }

    checkForSunkShips();
  };

  const checkForSunkShips = () => {
    const newSunkShips = { ...sunkShips };
    let updated = false;

    Object.entries(SHIP_LAYOUT).forEach(([shipName, { positions }]) => {
      const isSunk = positions.every(([r, c]) =>
        hits.some(([hr, hc]) => hr === r && hc === c)
      );

      if (isSunk && !newSunkShips[shipName as Ship]) {
        newSunkShips[shipName as Ship] = true;
        setScore((prev) => prev + 500); // Bonus for sinking a ship
        updated = true;
      }
    });

    if (updated) {
      setSunkShips(newSunkShips);
      const allSunk = Object.values(newSunkShips).every((sunk) => sunk);
      if (allSunk) {
        setGameOver(true);
        setScore((prev) => prev + 1000); // Bonus for winning
      }
    }
  };

  const resetGame = () => {
    setHits([]);
    setMisses([]);
    setGameOver(false);
    setSunkShips({
      carrier: false,
      battleship: false,
      cruiser: false,
      submarine: false,
      destroyer: false,
    });
    setScore(0);
    setLastHitShip(null);
  };

  return {
    hits,
    misses,
    gameOver,
    handleCellClick,
    sunkShips,
    score,
    lastHitShip,
    resetGame,
  };
};

export default useBattleshipGame;
