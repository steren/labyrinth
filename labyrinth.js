var parameters = {
    squareSize : 10, //px
    wallSize : 4,
    width: 20,
    height: 20,
    backgroundColor: '#000',
    startColor: '#fff',
    color: '#fff',
    startPosition: {x:5, y:5},
    // between 0 and first element: no divergeance, first parameter and second : 2 tunnels, secod anfd 1 : 3 tunnels
    growProbabilities : [0.95, 0.99],
    //growProbabilities : [0.99999, 0.999999],
    drawingTiming : 0
  };

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var maxDistance = 0;

function getColor(value) {
    //return 'hsl('+ Math.floor(value / maxDistance * 360) +', 100%, 70%)';
    //return 'hsl(0, 70%, ' + Math.floor(100 * value / maxDistance) +'%)';
    return parameters.color;
}

function drawLabyrinth(canvasElement, matrix, matrixWallX, matrixWallY, parameters) {
    canvas.width = parameters.width * ( parameters.squareSize + parameters.wallSize ) + parameters.wallSize;
    canvas.height = parameters.height * ( parameters.squareSize + parameters.wallSize ) + parameters.wallSize;

    ctx.fillStyle = parameters.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    for(var i = 0; i < matrix.length; i++) {
      for(var j = 0; j < matrix[i].length; j++) {
        if(matrix[i][j] !== 0) {

          ctx.fillStyle = getColor(matrix[i][j]);

          ctx.fillRect(parameters.wallSize + i * ( parameters.squareSize + parameters.wallSize),
              parameters.wallSize + j * ( parameters.squareSize + parameters.wallSize),
              parameters.squareSize,
              parameters.squareSize);
        }
      }
    }

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

    // ctx.fillStyle = parameters.startColor;
    // ctx.fillRect(parameters.wallSize + parameters.startPosition.x * ( parameters.squareSize + parameters.wallSize),
    //                 parameters.wallSize + parameters.startPosition.x * ( parameters.squareSize + parameters.wallSize),
    //                 parameters.squareSize,
    //                 parameters.squareSize);
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

function isBlackAndValid(x,y) {
    return x > -1
        && y > -1
        && x < parameters.width
        && y < parameters.height
        && labyrinth[x][y] === 0;
}

function isWhiteAndValid(x,y) {
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
    if(isBlackAndValid(toX, toY)) {

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

    if(isBlackAndValid(x+1,y)) {liberties++;}
    if(isBlackAndValid(x-1,y)) {liberties++;}
    if(isBlackAndValid(x,y+1)) {liberties++;}
    if(isBlackAndValid(x+1,y-1)) {liberties++;}

    return liberties;
}

function getNeighbour(x,y) {
    if(isWhiteAndValid(x+1,y)) {return [x+1,y];}
    if(isWhiteAndValid(x-1,y)) {return [x-1,y];}
    if(isWhiteAndValid(x,y+1)) {return [x,y+1];}
    if(isWhiteAndValid(x,y-1)) {return [x,y-1];}

    return false;
}

function growSquare(x,y) {

    var arr = [0, 1, 2, 3];
    // sort this array ! (eurk)
    var tmp;
    index = Math.min(Math.floor(Math.random() * 3), 3);
    tmp = arr[3];
    arr[3] = arr[index];
    arr[index] = tmp;
    index = Math.min(Math.floor(Math.random() * 2), 2);
    tmp = arr[2];
    arr[2] = arr[index];
    arr[index] = tmp;
    index = Math.min(Math.floor(Math.random() * 1), 1);
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


function checkBlack(){
    var i0 = Math.min( Math.floor( labyrinth.length*Math.random()), labyrinth.length-1);
    var j0 = Math.min(Math.floor(labyrinth[0].length*Math.random()), labyrinth.length-1);
    for(var i = 0; i < labyrinth.length; i++) {
        ic = (i+i0)%labyrinth.length;
        for(var j = 0; j < labyrinth[i].length; j++) {
            jc = (j+j0)%labyrinth[i].length;
            var n = getNeighbour(ic,jc);
            if(labyrinth[ic][jc] === 0 && n) {
                return [ic, jc, n[0], n[1]];
            }
        }
    }
    return false;
}

// stores the leafs to process;
var stack = [];
var start = [parameters.startPosition.x, parameters.startPosition.y]

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
        start = checkBlack();
        if(start != false) {
            stack.push([start[0], start[1]]);
            labyrinth[start[0]][start[1]] = labyrinth[start[2]][start[3]] +1;
            createWall(start[2],start[3], start[0],start[1]);
            setTimeout(iterate, parameters.drawingTiming);
        }
    }
}
    //start = checkBlack();
//}


// GOGOGO
setTimeout(iterate, parameters.drawingTiming);

drawLabyrinth(canvas, labyrinth, labWallX, labWallY, parameters);
