export default function move(gameState) {
  const myHead = gameState.you.body[0];
  const myBody = gameState.you.body;
  const boardWidth = gameState.board.width;
  const boardHeight = gameState.board.height;
  const snakes = gameState.board.snakes;
  const food = gameState.board.food;
  const hazards = gameState.board.hazards || [];
  const turn = gameState.turn;
  const directions = ["up", "down", "left", "right"];

  function getNextPosition(dir) {
    if (dir === "left") return { x: myHead.x - 1, y: myHead.y };
    if (dir === "right") return { x: myHead.x + 1, y: myHead.y };
    if (dir === "up") return { x: myHead.x, y: myHead.y + 1 };
    if (dir === "down") return { x: myHead.x, y: myHead.y - 1 };
  }

  function isSafe(x, y) {
    if (x < 0 || x >= boardWidth || y < 0 || y >= boardHeight) return false;
    for (const part of myBody) {
      if (part.x === x && part.y === y) return false;
    }
    for (const snake of snakes) {
      if (snake.id !== gameState.you.id) {
        for (const part of snake.body) {
          if (part.x === x && part.y === y) return false;
        }
      }
    }
    return true;
  }

  function isHazard(x, y) {
    return hazards.some(h => h.x === x && h.y === y);
  }

  // Split moves into safe vs danger
  const safeMoves = [];
  const dangerMoves = [];

  for (const dir of directions) {
    const nextPos = getNextPosition(dir);
    if (!isSafe(nextPos.x, nextPos.y)) continue;
    const neck = myBody[1];
    if (neck && nextPos.x === neck.x && nextPos.y === neck.y) continue;
    if (isHazard(nextPos.x, nextPos.y)) {
      dangerMoves.push(dir);
    } else {
      safeMoves.push(dir);
    }
  }

  const availableMoves = safeMoves.length > 0 ? safeMoves : dangerMoves;

  if (availableMoves.length === 0) return { move: "down" };

  function evaluateMove(dir) {
    const nextPos = getNextPosition(dir);
    if (!isSafe(nextPos.x, nextPos.y)) return -Infinity;

    let openSpaces = 0;
    const checks = [
      { x: nextPos.x + 1, y: nextPos.y },
      { x: nextPos.x - 1, y: nextPos.y },
      { x: nextPos.x, y: nextPos.y + 1 },
      { x: nextPos.x, y: nextPos.y - 1 },
    ];

    for (const check of checks) {
      if (isSafe(check.x, check.y)) openSpaces++;
    }

    // Penalize hazards
    if (isHazard(nextPos.x, nextPos.y)) {
      openSpaces -= 2;
    }

    return openSpaces;
  }

  // Split food into safe vs danger
  const safeFood = food.filter(f => !isHazard(f.x, f.y));
  const dangerFood = food.filter(f => isHazard(f.x, f.y));

  let foodTargets = [];
  if (safeFood.length > 0) {
    foodTargets = safeFood;
  } else {
    foodTargets = dangerFood;
  }

  let targetMove = null;

  // Chase food if low health
  if (gameState.you.health < 50 && foodTargets.length > 0) {
    let closestFood = null;
    let minDist = Infinity;

    for (const f of foodTargets) {
      const dist = Math.abs(myHead.x - f.x) + Math.abs(myHead.y - f.y);
      if (dist < minDist) {
        minDist = dist;
        closestFood = f;
      }
    }

    if (closestFood) {
      for (const dir of availableMoves) {
        const nextPos = getNextPosition(dir);
        const dist = Math.abs(nextPos.x - closestFood.x) + Math.abs(nextPos.y - closestFood.y);

        if (dist === minDist) {
          targetMove = dir;
          break;
        }
      }
    }
  }

  // Hunt weaker snakes late game
  if (!targetMove && turn > 150) {
    let targetSnake = null;
    let minDist = Infinity;

    for (const snake of snakes) {
      if (snake.id !== gameState.you.id && snake.body.length < myBody.length) {
        const head = snake.body[0];
        const dist = Math.abs(myHead.x - head.x) + Math.abs(myHead.y - head.y);

        if (dist < minDist) {
          minDist = dist;
          targetSnake = snake;
        }
      }
    }

    if (targetSnake) {
      const targetHead = targetSnake.body[0];

      for (const dir of availableMoves) {
        const nextPos = getNextPosition(dir);
        const dist = Math.abs(nextPos.x - targetHead.x) + Math.abs(nextPos.y - targetHead.y);

        if (dist === minDist) {
          targetMove = dir;
          break;
        }
      }
    }
  }

  // Default: pick safest move
  if (!targetMove) {
    let bestDir = availableMoves[0];
    let bestScore = -Infinity;

    for (const dir of availableMoves) {
      const score = evaluateMove(dir);

      if (score > bestScore) {
        bestScore = score;
        bestDir = dir;
      }
    }

    targetMove = bestDir;
  }

  return { move: targetMove };
}
