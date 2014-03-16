engineParameters = {
  /** ideal ratio to respect between the suqre size and the wall size */
  squareWallRatio : 10
}

/** Parameters needed to generate the maze */
var parameters = {
    squareSize : 5, //px
    wallSize : 3,
    width: 100,
    height: 100,
    style: {
      backgroundColor: '#000',
      squareColor: '#fff',
      startColor: '#f00',
      endColor: '#0f0',
      pathColor: '#aaf'
    },
    draw: {
      start : true,
      end : true,
      path : true
    },
    startRandom : true,
    startPosition: {x:5, y:5},
    // between 0 and first element: no divergeance, first parameter and second : 2 tunnels, secod anfd 1 : 3 tunnels
    //growProbabilities : [0.95, 0.99],
    growProbabilities : [0.99999, 0.999999],
    drawingTiming : 0
  };

//computeSquareSize(1680, 1050, parameters);

//parameters.wallSize = 0;

/** Will set parameters.squareSize and wallSize to better match teh desired width and height considering the width and height of the parameters */
function computeSquareSize(desiredWidth, desiredHeight, parameters) {
  var sizeW = desiredWidth / ( parameters.width * (1 + 1 / engineParameters.squareWallRatio));
  var sizeH = desiredHeight / ( parameters.height * (1 + 1 / engineParameters.squareWallRatio));

  parameters.squareSize = Math.floor(Math.min(sizeW, sizeH));
  parameters.wallSize = Math.ceil(parameters.squareSize / engineParameters.squareWallRatio);
};

var startPosition = parameters.startPosition;
if(parameters.startRandom) {
  startPosition = {x : Math.floor(Math.random() * parameters.width), y: Math.floor(Math.random() * parameters.height)};
}
var endPosition;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var maxDistance = 0;

function getColor(value) {
    //return 'hsl('+ Math.floor(value / maxDistance * 360) +', 100%, 70%)';
    //return 'hsl(0, 70%, ' + Math.floor(100 * value / maxDistance) +'%)';
    return parameters.style.squareColor;
}

function drawLabyrinth(canvasElement, matrix, matrixWallX, matrixWallY, parameters) {
    canvas.width = parameters.width * ( parameters.squareSize + parameters.wallSize ) + parameters.wallSize;
    canvas.height = parameters.height * ( parameters.squareSize + parameters.wallSize ) + parameters.wallSize;

    function drawSquare(x,y) {
      ctx.fillRect(parameters.wallSize + x * ( parameters.squareSize + parameters.wallSize),
          parameters.wallSize + y * ( parameters.squareSize + parameters.wallSize),
          parameters.squareSize,
          parameters.squareSize);
    };
    
    function drawWallBetween(fromX, fromY, toX, toY) {
      var diffX = toX - fromX;
      var diffY = toY - fromY;
      
      if( diffX === 0 && diffY > 0) {

        ctx.fillRect(
            parameters.wallSize + fromX * (parameters.wallSize + parameters.squareSize),
            parameters.wallSize + fromY * (parameters.wallSize + parameters.squareSize) + parameters.squareSize,
            parameters.squareSize,
            parameters.wallSize
        );

      } else if (diffX === 0 && diffY < 0) {

        ctx.fillRect(
            parameters.wallSize + fromX * (parameters.wallSize + parameters.squareSize),
            parameters.wallSize + toY * (parameters.wallSize + parameters.squareSize) + parameters.squareSize,
            parameters.squareSize,
            parameters.wallSize
        );

      } else if (diffX > 0 && diffY === 0) {

        ctx.fillRect(
            parameters.wallSize + fromX * (parameters.wallSize + parameters.squareSize) + parameters.squareSize,
            parameters.wallSize + toY * (parameters.wallSize + parameters.squareSize),
            parameters.wallSize,
            parameters.squareSize
        );

      } else {

        ctx.fillRect(
            parameters.wallSize + toX * (parameters.wallSize + parameters.squareSize) + parameters.squareSize,
            parameters.wallSize + toY * (parameters.wallSize + parameters.squareSize),
            parameters.wallSize,
            parameters.squareSize
        );

      }

    
    }

    // background
    ctx.fillStyle = parameters.style.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw hollow squares
    for(var i = 0; i < matrix.length; i++) {
      for(var j = 0; j < matrix[i].length; j++) {
        if(matrix[i][j] !== 0) {
          ctx.fillStyle = getColor(matrix[i][j]);
          drawSquare(i,j);
        }
      }
    }

    // draw vertical walls
    for(var i = 0; i < matrixWallX.length; i++) {
      for(var j = 0; j < matrixWallX[i].length; j++) {
        if(matrixWallX[i][j] !== 0) {
          ctx.fillStyle = getColor(matrixWallX[i][j]);
          ctx.fillRect(i * ( parameters.squareSize + parameters.wallSize),
              parameters.wallSize + j * ( parameters.squareSize + parameters.wallSize),
              parameters.wallSize,
              parameters.squareSize);
        }
      }
    }

    // draw horizontal walls
    for(var i = 0; i < matrixWallY.length; i++) {
      for(var j = 0; j < matrixWallY[i].length; j++) {
        if(matrixWallY[i][j] !== 0) {
          ctx.fillStyle = getColor(matrixWallY[i][j]);
          ctx.fillRect(parameters.wallSize + i * ( parameters.squareSize + parameters.wallSize),
              j * ( parameters.squareSize + parameters.wallSize),
              parameters.squareSize,
              parameters.wallSize);
        }
      }
    }

    if(parameters.draw.path) {
      ctx.fillStyle = parameters.style.pathColor;
      findEndPosition();
      var solution = findSolutionPath(startPosition, endPosition);
      for(var i = 0; i < solution.length; i++) {
         drawSquare(solution[i][0], solution[i][1]);
         if(i > 0) {
           drawWallBetween(solution[i-1][0], solution[i-1][1], solution[i][0], solution[i][1])
         }
      }
    }

    if(parameters.draw.start) {
      ctx.fillStyle = parameters.style.startColor;
      drawSquare(startPosition.x, startPosition.y);
    }

    if(parameters.draw.end) {
      findEndPosition();
      ctx.fillStyle = parameters.style.endColor;
      drawSquare(endPosition[0], endPosition[1]);
    }

  }

//////// Initialisation

// will store our labyrinth
var labyrinth = []; // store the distance from the origin
// vertical walls
var labWallX = []; // size: x: n+1, y:n
// horizontal walls
var labWallY = []; // size: x: n, y: n+1

// start with an empty labyrinth of the correct size
labyrinth = [];
for(var i = 0; i < parameters.width; i++) {
  labyrinth.push([]);
  for(var j = 0; j < parameters.height; j++) {
    labyrinth[i].push(0);
  }
}
for(var i = 0; i < parameters.width + 1; i++) {
  labWallX.push([]);
  for(var j = 0; j < parameters.height; j++) {
    labWallX[i].push(0);
  }
}
for(var i = 0; i < parameters.width; i++) {
  labWallY.push([]);
  for(var j = 0; j < parameters.height + 1; j++) {
    labWallY[i].push(0);
  }
}

/** check position is not outside and is not a hollow square */
function isNotHollowAndValid(x,y) {
    return x > -1
        && y > -1
        && x < parameters.width
        && y < parameters.height
        && labyrinth[x][y] === 0;
}

/** check position is not outside and is a hollow square */
function isHollowAndValid(x,y) {
    return x > -1
        && y > -1
        && x < parameters.width
        && y < parameters.height
        && labyrinth[x][y] > 0;
}

function createWall(fromX, fromY, toX, toY) {
    var diffX = toX - fromX;
    var diffY = toY - fromY;

    var wallColor = labyrinth[fromX][fromY] + 0.5

    if( diffX === 0 && diffY > 0) {
        labWallY[toX][toY] = wallColor;
    } else if (diffX === 0 && diffY < 0) {
        labWallY[toX][fromY] = wallColor;
    } else if (diffX > 0 && diffY === 0) {
        labWallX[toX][toY] = wallColor;
    } else {
        labWallX[fromX][toY] = wallColor;
    }
}

function tryToGrow(fromX, fromY, toX, toY) {
    if(isNotHollowAndValid(toX, toY)) {

        labyrinth[toX][toY] = labyrinth[fromX][fromY] + 1;
        maxDistance = Math.max(maxDistance, labyrinth[toX][toY]);

        createWall(fromX, fromY, toX, toY);

        stack.push([toX, toY]);
        return true;

    } else {
        return false;
    }
}

function directionsToCoordinates(x, y, direction) {
    switch(direction){
        case 0:
            return [x, y-1];
        case 1:
            return [x+1, y];
        case 2:
            return [x, y+1];
        case 3:
            return [x-1, y];
    }
}

function getLiberties(x,y) {
    var liberties = 0;

    if(isNotHollowAndValid(x+1,y)) {liberties++;}
    if(isNotHollowAndValid(x-1,y)) {liberties++;}
    if(isNotHollowAndValid(x,y+1)) {liberties++;}
    if(isNotHollowAndValid(x,y-1)) {liberties++;}

    return liberties;
}

/** @return the valid neighboors (doesn't care about walls) */
function getNeighbours(x,y) {
    var neighboors = [];

    if(isHollowAndValid(x+1,y)) {neighboors.push([x+1,y]);}
    if(isHollowAndValid(x-1,y)) {neighboors.push([x-1,y]);}
    if(isHollowAndValid(x,y+1)) {neighboors.push([x,y+1]);}
    if(isHollowAndValid(x,y-1)) {neighboors.push([x,y-1]);}

    return neighboors;
}

function getConnectedNeighboors(x,y) {
    var neighboors = [];

    if(isHollowAndValid(x+1,y) && labWallX[x+1][y] !== 0) {neighboors.push([x+1,y]);}
    if(isHollowAndValid(x-1,y) && labWallX[x][y] !== 0) {neighboors.push([x-1,y]);}
    if(isHollowAndValid(x,y+1) && labWallY[x][y+1] !== 0) {neighboors.push([x,y+1]);}
    if(isHollowAndValid(x,y-1) && labWallY[x][y] !== 0) {neighboors.push([x,y-1]);}

    return neighboors;
}

function growSquare(x,y) {

    var arr = [0, 1, 2, 3];
    // sort this array ! (eurk)
    var tmp;
    index = Math.floor(Math.random() * 4);
    tmp = arr[3];
    arr[3] = arr[index];
    arr[index] = tmp;
    index = Math.floor(Math.random() * 3);
    tmp = arr[2];
    arr[2] = arr[index];
    arr[index] = tmp;
    index = Math.floor(Math.random() * 2);
    tmp = arr[1];
    arr[1] = arr[index];
    arr[index] = tmp;

    // try to go in that number of direction
    var numberDirection = 1;
    var rand = Math.random();
    if(rand > parameters.growProbabilities[1]) {
      numberDirection = 3;
    } else if(rand > parameters.growProbabilities[0]) {
      numberDirection = 2;
    }

    /*
    if(getLiberties(x,y) == 2) {
        numberDirection = 2;
    }
    */

    var success = 0;
    for(var i = 0; i < 4; i++) {
        var goCoord = directionsToCoordinates(x, y, arr[i])
        var hasGrown = tryToGrow(x, y, goCoord[0], goCoord[1]);
        if(hasGrown) {
            success++;
        }
        if(success >= numberDirection) {
            break;
        }
    }
}

function findEndPosition() {
  var found = false;
  for(var i = 0; i < labyrinth.length; i++) {
    if(!found) {
      for(var j = 0; j < labyrinth[i].length; j++) {
        if(labyrinth[i][j] === maxDistance) {
          endPosition = [i,j];
          found = true;
          break;
        }
      }
    }
  }
}

/** @return an array of position of the  */
function findSolutionPath(startPos, endPos) {
  var path = [];

  path.push(endPos);

  findEndPosition();
  var currentPathPosition = endPosition;
  var currentDistance = maxDistance;
  // go from the end to the start, look for previous square at each step.
  while(currentDistance > 1) {
    var n = getConnectedNeighboors(currentPathPosition[0], currentPathPosition[1]);
    for( var i = 0; i < n.length; i++) {
      if(labyrinth[n[i][0]][n[i][1]] === (currentDistance - 1)) {
        path.push(n[i]);
        currentPathPosition = n[i];
        currentDistance--;
        break;
      }
    }
  }


  return path;
}

/** @return an available non-hollow position that is near a hollow position */
function findNotHollowSquareWithHollowNeighboor(){
    var i0 = Math.floor(labyrinth.length*Math.random());
    var j0 = Math.floor(labyrinth[0].length*Math.random());

    var randXDirection = Math.random() > 0.5 ? -1 : 1;
    var randYDirection = Math.random() > 0.5 ? -1 : 1;

    for(var i = 0; i < labyrinth.length; i++) {
        ic = ( i0 + randXDirection * i + labyrinth.length ) % labyrinth.length; // added the modulo value to make sure the result is > 0
        for(var j = 0; j < labyrinth[i].length; j++) {
            jc = ( j0 + randXDirection * j + labyrinth[i].length ) % labyrinth[i].length;

            if(labyrinth[ic][jc] === 0) {
              var n = getNeighbours(ic,jc);
              if(n.length > 0) {
                return [ic, jc, n[0][0], n[0][1]];
              }
            }
        }
    }
    return false;
}

// stores the leafs to process;
var stack = [];
var start = [startPosition.x, startPosition.y];

// use while to compute everything without setTimeout
//while(start) {
stack.push(start);
labyrinth[start[0]][start[1]] = 1;


function iterate() {

    if(stack.length != 0) {

    // use while to compute everything without setTimeout
    //while(stack.length > 0) {
        var leaf = stack.shift();
        growSquare(leaf[0], leaf[1]);
        drawLabyrinth(canvas, labyrinth, labWallX, labWallY, parameters);
        setTimeout(iterate, parameters.drawingTiming / stack.length);
    }
    else {
        start = findNotHollowSquareWithHollowNeighboor();
        if(start != false) {
            stack.push([start[0], start[1]]);
            labyrinth[start[0]][start[1]] = labyrinth[start[2]][start[3]] +1;
            createWall(start[2],start[3], start[0],start[1]);
            setTimeout(iterate, parameters.drawingTiming);
        }
    }
}
    //start = findNotHollowSquareWithHollowNeighboor();
//}


// GOGOGO
setTimeout(iterate, parameters.drawingTiming);

drawLabyrinth(canvas, labyrinth, labWallX, labWallY, parameters);
