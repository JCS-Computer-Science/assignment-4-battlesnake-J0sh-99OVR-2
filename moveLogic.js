export default function move(gameState) {
  const myHead = gameState.you.body[0];
  const myBody = gameState.you.body;
  const boardWidth = gameState.board.width;
  const boardHeight = gameState.board.height;
  const snakes = gameState.board.snakes;
  const food = gameState.board.food;
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
    for (const part of myBody) if (part.x === x && part.y === y) return false;
    for (const snake of snakes) {
      if (snake.id !== gameState.you.id) {
        for (const part of snake.body) if (part.x === x && part.y === y) return false;
      }
    }
    return true;
  }

  // Filter moves that are safe and not reversing
  const safeMoves = directions.filter(dir => {
    const nextPos = getNextPosition(dir);
    if (!isSafe(nextPos.x, nextPos.y)) return false;
    const neck = myBody[1];
    if (neck && nextPos.x === neck.x && nextPos.y === neck.y) return false;
    return true;
  });

  // If no safe moves, fallback to "down"
  if (safeMoves.length === 0) return { move: "down" };

  // Helper to evaluate move safety and predictability
  function evaluateMove(dir) {
    const nextPos = getNextPosition(dir);
    if (!isSafe(nextPos.x, nextPos.y)) return -Infinity;
    // Count open spaces around the next position for better safety
    let openSpaces = 0;
    const checks = [
      { x: nextPos.x + 1, y: nextPos.y },
      { x: nextPos.x - 1, y: nextPos.y },
      { x: nextPos.x, y: nextPos.y + 1 },
      { x: nextPos.x, y: nextPos.y - 1 },
    ];
    for (const check of checks) if (isSafe(check.x, check.y)) openSpaces++;
    return openSpaces;
  }

  // Decide target move: chase food if low health
  let targetMove = null;
  if (gameState.you.health < 50 && food.length > 0) {
    let closestFood = null;
    let minDist = Infinity;
    for (const f of food) {
      const dist = Math.abs(myHead.x - f.x) + Math.abs(myHead.y - f.y);
      if (dist < minDist) {
        minDist = dist;
        closestFood = f;
      }
    }
    if (closestFood) {
      for (const dir of safeMoves) {
        const nextPos = getNextPosition(dir);
        const dist = Math.abs(nextPos.x - closestFood.x) + Math.abs(nextPos.y - closestFood.y);
        if (dist === minDist) {
          targetMove = dir;
          break;
        }
      }
    }
  }

  // After turn 150, target weaker snakes
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
      for (const dir of safeMoves) {
        const nextPos = getNextPosition(dir);
        const dist = Math.abs(nextPos.x - targetHead.x) + Math.abs(nextPos.y - targetHead.y);
        if (dist === minDist) {
          targetMove = dir;
          break;
        }
      }
    }
  }

  // If no specific target, pick move with most open space
  if (!targetMove) {
    let bestDir = safeMoves[0];
    let bestScore = -1;
    for (const dir of safeMoves) {
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