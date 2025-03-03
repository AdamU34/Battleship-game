import { useState, useCallback } from "react";

export type Position = [number, number];
export type Ship =
  | "carrier"
  | "battleship"
  | "cruiser"
  | "submarine"
  | "destroyer";

type ShipLayout = {
  size: number;
  positions: Position[];
};

type ShipLayouts = Record<Ship, ShipLayout>;

function randomizeShipPositions(): ShipLayouts {
  const GRID_SIZE = 10;
  // Initialize each ship with its size and an empty positions array
  const ships: ShipLayouts = {
    carrier: { size: 5, positions: [] },
    battleship: { size: 4, positions: [] },
    cruiser: { size: 3, positions: [] },
    submarine: { size: 3, positions: [] },
    destroyer: { size: 2, positions: [] },
  };
  // Helper function to validate that positions are within bounds and don't overlap
  const isValidPlacement = (
    positions: Position[],
    occupied: Position[]
  ): boolean =>
    positions.every(
      ([x, y]) =>
        x >= 0 &&
        x < GRID_SIZE &&
        y >= 0 &&
        y < GRID_SIZE &&
        !occupied.some(([ox, oy]) => ox === x && oy === y)
    );
  let occupiedPositions: Position[] = [];
  // Loop through each ship and try to place it until a valid set of positions is found
  for (const shipName in ships) {
    const ship = shipName as Ship;
    const size = ships[ship].size;
    let newPositions: Position[] = [];
    let valid = false;
    while (!valid) {
      // Randomly decide on orientation: horizontal or vertical
      const isHorizontal = Math.random() > 0.5;
      // Choose random starting coordinates
      const startX = Math.floor(Math.random() * GRID_SIZE);
      const startY = Math.floor(Math.random() * GRID_SIZE);

      // Generate ship positions based on the orientation and size
      newPositions = Array.from({ length: size }, (_, i) => [
        isHorizontal ? startX + i : startX,
        isHorizontal ? startY : startY + i,
      ]);
      // Validate the generated positions
      valid = isValidPlacement(newPositions, occupiedPositions);
    }
    // Save valid positions and update the occupied positions list
    ships[ship].positions = newPositions;
    occupiedPositions = occupiedPositions.concat(newPositions);
  }

  return ships;
}

export const SHIP_LAYOUT: ShipLayouts = randomizeShipPositions();

const SCORE_VALUES = {
  HIT: 100,
  MISS_PENALTY: 10,
  SHIP_SUNK: 500,
  GAME_WIN: 1000,
} as const;

export interface GameState {
  hits: Position[];
  misses: Position[];
  gameOver: boolean;
  sunkShips: Record<Ship, boolean>;
  score: number;
  lastHitShip: Ship | null;
}

const useBattleshipGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    hits: [],
    misses: [],
    gameOver: false,
    sunkShips: {
      carrier: false,
      battleship: false,
      cruiser: false,
      submarine: false,
      destroyer: false,
    },
    score: 0,
    lastHitShip: null,
  });

  const isPositionTaken = useCallback(
    (row: number, col: number): boolean => {
      return (
        gameState.hits.some(([r, c]) => r === row && c === col) ||
        gameState.misses.some(([r, c]) => r === row && c === col)
      );
    },
    [gameState.hits, gameState.misses]
  );

  const findHitShip = useCallback((row: number, col: number): Ship | null => {
    const shipName = Object.keys(SHIP_LAYOUT).find((shipName) =>
      SHIP_LAYOUT[shipName as Ship].positions.some(
        ([r, c]) => r === row && c === col
      )
    );
    return shipName ? (shipName as Ship) : null;
  }, []);

  const checkForSunkShips = useCallback(
    (hits: Position[]): Record<Ship, boolean> => {
      const sunkShips = {} as Record<Ship, boolean>;

      for (const [shipName, { positions }] of Object.entries(SHIP_LAYOUT) as [
        Ship,
        ShipLayout
      ][]) {
        sunkShips[shipName] = positions.every(([r, c]) =>
          hits.some(([hr, hc]) => hr === r && hc === c)
        );
      }

      return sunkShips;
    },
    []
  );

  const handleCellClick = useCallback(
    (row: number, col: number): void => {
      if (gameState.gameOver || isPositionTaken(row, col)) return;

      const hitShip = findHitShip(row, col);
      let newScore = gameState.score;
      let newHits = gameState.hits;
      let newMisses = gameState.misses;

      if (hitShip) {
        newHits = [...gameState.hits, [row, col] as Position];
        newScore += SCORE_VALUES.HIT;
      } else {
        newMisses = [...gameState.misses, [row, col] as Position];
        newScore = Math.max(0, newScore - SCORE_VALUES.MISS_PENALTY);
      }

      const newSunkShips = checkForSunkShips(newHits);
      const previouslySunkCount = Object.values(gameState.sunkShips).filter(
        Boolean
      ).length;
      const newlySunkCount = Object.values(newSunkShips).filter(Boolean).length;

      if (newlySunkCount > previouslySunkCount) {
        newScore += SCORE_VALUES.SHIP_SUNK;
      }

      const allShipsSunk = Object.values(newSunkShips).every(Boolean);
      if (allShipsSunk) {
        newScore += SCORE_VALUES.GAME_WIN;
      }

      setGameState({
        hits: newHits,
        misses: newMisses,
        gameOver: allShipsSunk,
        sunkShips: newSunkShips,
        score: newScore,
        lastHitShip: hitShip,
      });
    },
    [gameState, isPositionTaken, findHitShip, checkForSunkShips]
  );

  const resetGame = useCallback((): void => {
    setGameState({
      hits: [],
      misses: [],
      gameOver: false,
      sunkShips: {
        carrier: false,
        battleship: false,
        cruiser: false,
        submarine: false,
        destroyer: false,
      },
      score: 0,
      lastHitShip: null,
    });
  }, []);

  return {
    ...gameState,
    handleCellClick,
    resetGame,
  };
};

export default useBattleshipGame;
