export default function move(gameState){
    let moveSafety = {
        up: true,
        down: true,
        left: true,
        right: true
    };
   
    const myHead = gameState.you.body[0];
    const myNeck = gameState.you.body[1];
   
    if (myNeck.x < myHead.x) {
        moveSafety.left = false;
    } else if (myNeck.x > myHead.x) {
        moveSafety.right = false;
    } else if (myNeck.y < myHead.y) {
        moveSafety.down = false;
    } else if (myNeck.y > myHead.y) {
        moveSafety.up = false;
    }
   
    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;

    if (myHead.x === 0) moveSafety.left = false;
    if (myHead.x === boardWidth - 1) moveSafety.right = false;
    if (myHead.y === 0) moveSafety.down = false;
    if (myHead.y === boardHeight - 1) moveSafety.up = false;

    const myBody = gameState.you.body;

    for (let i = 1; i < myBody.length; i++) {
        const part = myBody[i];
        if (part.x === myHead.x && part.y === myHead.y + 1) moveSafety.up = false;
        if (part.x === myHead.x && part.y === myHead.y - 1) moveSafety.down = false;
        if (part.x === myHead.x - 1 && part.y === myHead.y) moveSafety.left = false;
        if (part.x === myHead.x + 1 && part.y === myHead.y) moveSafety.right = false;
    }

    const enemySnakes = gameState.board.snakes;

    for(let i = 0; i < enemySnakes.length; i++){
        const enemy = enemySnakes[i];

        if(enemy.id === gameState.you.id) continue;

        const enemyHead = enemy.body[0];

        const dx = enemyHead.x - myHead.x;
        const dy = enemyHead.y - myHead.y;

        const distance = Math.abs(dx) + Math.abs(dy);

        // if enemy is close, don't move toward it
        if (distance <= 2) {
            if (dx < 0) moveSafety.left = false;
            if (dx > 0) moveSafety.right = false;
            if (dy < 0) moveSafety.down = false;
            if (dy > 0) moveSafety.up = false;
        }


        if (distance === 1) {
            if (dx === -1) moveSafety.left = false;
            if (dx === 1) moveSafety.right = false;
            if (dy === -1) moveSafety.down = false;
            if (dy === 1) moveSafety.up = false;
        }
    }


    function countOpenSpaces(x, y) {
    let count = 0;

    if (x > 0) count++;
    if (x < boardWidth - 1) count++;
    if (y > 0) count++;
    if (y < boardHeight - 1) count++;

    // reduce for your own body
    for (let i = 0; i < myBody.length; i++) {
        const part = myBody[i];

        if (part.x === x && part.y === y + 1) count--;
        if (part.x === x && part.y === y - 1) count--;
        if (part.x === x - 1 && part.y === y) count--;
        if (part.x === x + 1 && part.y === y) count--;
    }

    return count;
}

// check each possible move
if (moveSafety.up) {
    let spaces = countOpenSpaces(myHead.x, myHead.y + 1);
    if (spaces <= 1) moveSafety.up = false;
}

if (moveSafety.down) {
    let spaces = countOpenSpaces(myHead.x, myHead.y - 1);
    if (spaces <= 1) moveSafety.down = false;
}

if (moveSafety.left) {
    let spaces = countOpenSpaces(myHead.x - 1, myHead.y);
    if (spaces <= 1) moveSafety.left = false;
}

if (moveSafety.right) {
    let spaces = countOpenSpaces(myHead.x + 1, myHead.y);
    if (spaces <= 1) moveSafety.right = false;
}

    const safeMoves = Object.keys(moveSafety).filter(dir => moveSafety[dir]);

    if (safeMoves.length === 0) {
        console.log(`MOVE ${gameState.turn}: No safe moves`);
        return { move: "down" };
    }

    const food = gameState.board.food;
    let closestFood = null;
    let closestDistance = 9999;

    for (let i = 0; i < food.length; i++) {
        const f = food[i];
        const distance = Math.abs(myHead.x - f.x) + Math.abs(myHead.y - f.y);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestFood = f;
        }
    }

    let nextMove = null;

    if (closestFood) {
        if (closestFood.x < myHead.x && moveSafety.left) {
            nextMove = "left";
        } else if (closestFood.x > myHead.x && moveSafety.right) {
            nextMove = "right";
        } else if (closestFood.y < myHead.y && moveSafety.down) {
            nextMove = "down";
        } else if (closestFood.y > myHead.y && moveSafety.up) {
            nextMove = "up";
        }
    }

    if (!nextMove) {
        nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
    }

    console.log(`MOVE ${gameState.turn}: ${nextMove}`);
    return { move: nextMove };
}





    // TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
    // gameState.board contains an object representing the game board including its width and height
    // https://docs.battlesnake.com/api/objects/board
    
    // TODO: Step 2 - Prevent your Battlesnake from colliding with itself
    // gameState.you contains an object representing your snake, including its coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
    
    
    // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
    // gameState.board.snakes contains an array of enemy snake objects, which includes their coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
    
    // Are there any safe moves left?
    
    //Object.keys(moveSafety) returns ["up", "down", "left", "right"]
    //.filter() filters the array based on the function provided as an argument (using arrow function syntax here)
    //In this case we want to filter out any of these directions for which moveSafety[direction] == false
    // Choose a random move from the safe moves
    // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
    // gameState.board.food contains an array of food coordinates https://docs.battlesnake.com/api/objects/board