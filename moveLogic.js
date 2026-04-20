export default function move(gameState){

    const myHead = gameState.you.body[0];
    const myNeck = gameState.you.body[1];
    const myBody = gameState.you.body;
    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;
    const snakes = gameState.board.snakes;
    const food = gameState.board.food;
    const myHealth = gameState.you.health;
    const turn = gameState.turn;
    const directions = ["up", "down", "left", "right"];

      function getNextPosition(dir){
        return {
            x: dir === "left" ? myHead.x - 1 :
               dir === "right" ? myHead.x + 1 : myHead.x,
            y: dir === "up" ? myHead.y + 1 :
               dir === "down" ? myHead.y - 1 : myHead.y
        };
    }

    function isSafe (x,y){
        if(x < 0 || x >= boardWidth || y < 0 || y >= boardHeight){
            return false;
        }
        for(let part of myBody){
            if(part.x === x && part.y === y){
                return false;
            }
        }
        for(let snake of snakes){
            for(let part of snake.body){
                if(part.x === x && part.y === y){
                    return false;
                }
            }
        } return true;
    }

    function countOpenSpaces(x,y){
     let count = 0;
     const checks = [
        {x: x + 1, y: y},
        {x: x- 1, y: y},
        {x: x, y: y + 1},
        {x: x, y: y}
     ];
    }

    for (let pos of checks){
        if(isSafe(pos.x, pos.y)){
            count++;
        }
    } return count;
}

let moveSaftey = {
    up: true,
    down: true,
    left: true,
    right: true
};

    if (myNeck.x < myHead.x) moveSafety.left = false;
    else if (myNeck.x > myHead.x) moveSafety.right = false;
    else if (myNeck.y < myHead.y) moveSafety.down = false;
    else if (myNeck.y > myHead.y) moveSafety.up = false;
 for (let dir of directions){
        const next = getNextPosition(dir);
        if (!isSafe(next.x, next.y)){
            moveSafety[dir] = false;
        }
    }


     for (let snake of snakes){
        if (snake.id === gameState.you.id) continue;


        const enemyHead = snake.body[0];


        const possibleMoves = [
            {x: enemyHead.x + 1, y: enemyHead.y},
            {x: enemyHead.x - 1, y: enemyHead.y},
            {x: enemyHead.x, y: enemyHead.y + 1},
            {x: enemyHead.x, y: enemyHead.y - 1}
        ];


        for (let dir of directions){
            if (!moveSafety[dir]) continue;
            const next = getNextPosition(dir);
            for (let pos of possibleMoves){
                if (
                    next.x === pos.x &&
                    next.y === pos.y &&
                    snake.body.length >= myBody.length
                ){
                    moveSafety[dir] = false;
                }
            }
        }
    }


     for (let dir of directions){
        if (!moveSafety[dir]) continue;


        const next = getNextPosition(dir);
        if (countOpenSpaces(next.x, next.y) <= 1){
            moveSafety[dir] = false;
        }
    }


    const safeMoves = directions.filter(dir => moveSafety[dir]);


    if (safeMoves.length === 0){
        return { move: "down" };
    }


    let nextMove = null;


     if (myHealth < 50){
        let closestFood = null;
        let closestDistance = Infinity;


        for (let f of food){
            const dist = Math.abs(myHead.x - f.x) + Math.abs(myHead.y - f.y);


            if (dist < closestDistance){
                closestDistance = dist;
                closestFood = f;
            }
        }


        if (closestFood){
            if (closestFood.x < myHead.x && moveSafety.left) nextMove = "left";
            else if (closestFood.x > myHead.x && moveSafety.right) nextMove = "right";
            else if (closestFood.y < myHead.y && moveSafety.down) nextMove = "down";
            else if (closestFood.y > myHead.y && moveSafety.up) nextMove = "up";
        }
    }

    if (!nextMove && turn > 150){
        let target = null;
      let  closestDistance = Infinity;
        for (let snake of snakes){
            if (snake.id === gameState.you.id) continue;
           if (snake.body.length >= myBody.length) continue
            const enemyHead = snake.body[0];
            const dist = Math.abs(myHead.x - enemyHead.x) + Math.abs(myHead.y - enemyHead.y);

            if (dist < closestDistance){
                closestDistance = dist;
                target = enemyHead;
            }
        }

        if (target){
            if (target.x < myHead.x && moveSafety.left) nextMove = "left";
            else if (target.x > myHead.x && moveSafety.right) nextMove = "right";
            else if (target.y < myHead.y && moveSafety.down) nextMove = "down";
            else if (target.y > myHead.y && moveSafety.up) nextMove = "up";
        }
    }

    if (!nextMove){
       let bestMove = safeMoves[0];
       let bestScore = -1;
       for ( let dir of safeMoves){
            const next = getNextPosition(dir);
            const score = countOpenSpaces(next.x, next.y);
            if (score > bestScore){
                bestScore = score;
                bestMove = dir;
            }
       }
       nextMove = bestMove; 
    }
    return { move: nextMove };
}