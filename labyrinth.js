function labyrinth(engineParameters) {

  var defaultEngineParameters = {
      width: 20, //units
      height: 20, //units
      startRandom : true,
      startPosition: {x:0, y:0},
      // between 0 and first element: no divergeance, first parameter and second : 2 tunnels, secod anfd 1 : 3 tunnels
      //growProbabilities : [0.95, 0.99],
      growProbabilities : [0.99999, 0.999999],
      goToGlobalDirectionProbability: 0.33,
      useGlobalDirection: true
  }

  _.defaults(engineParameters, defaultEngineParameters)

  var startPosition = engineParameters.startPosition;
  if(engineParameters.startRandom) {
    startPosition = {x : Math.floor(Math.random() * engineParameters.width), y: Math.floor(Math.random() * engineParameters.height)};
  }
  var endPosition;

  var maxDistance = 0;

  //////// Initialisation

  // will store our labyrinth
  var labyrinth = []; // store the distance from the origin
  // vertical walls
  var labWallX = []; // size: x: n+1, y:n
  // horizontal walls
  var labWallY = []; // size: x: n, y: n+1

  // start with an empty labyrinth of the correct size
  labyrinth = [];
  for(var i = 0; i < engineParameters.width; i++) {
    labyrinth.push([]);
    for(var j = 0; j < engineParameters.height; j++) {
      labyrinth[i].push(0);
    }
  }
  for(var i = 0; i < engineParameters.width + 1; i++) {
    labWallX.push([]);
    for(var j = 0; j < engineParameters.height; j++) {
      labWallX[i].push(0);
    }
  }
  for(var i = 0; i < engineParameters.width; i++) {
    labWallY.push([]);
    for(var j = 0; j < engineParameters.height + 1; j++) {
      labWallY[i].push(0);
    }
  }

  /** check position is not outside and is not a hollow square */
  function isNotHollowAndValid(x,y) {
      return x > -1
          && y > -1
          && x < engineParameters.width
          && y < engineParameters.height
          && labyrinth[x][y] === 0;
  }

  /** check position is not outside and is a hollow square */
  function isHollowAndValid(x,y) {
      return x > -1
          && y > -1
          && x < engineParameters.width
          && y < engineParameters.height
          && labyrinth[x][y] > 0;
  }

  function diggWall(fromX, fromY, toX, toY) {
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

  function tryToGrow(fromX, fromY, toX, toY, stack) {
      if(isNotHollowAndValid(toX, toY)) {

          labyrinth[toX][toY] = labyrinth[fromX][fromY] + 1;
          maxDistance = Math.max(maxDistance, labyrinth[toX][toY]);

          diggWall(fromX, fromY, toX, toY);

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

  /** @return direction (0,1,2,3) */
  function coordinatesToDirections(fromX, fromY, toX, toY) {
      var diffX = toX - fromX;
      var diffY = toY - fromY;

      if( diffX === 0 && diffY > 0) {
          return 2;
      } else if (diffX === 0 && diffY < 0) {
          return 0;
      } else if (diffX > 0 && diffY === 0) {
          return 1;
      } else {
          return 3;
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

  function shuffleArray4(arr) {
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

      return arr;
  }


  function growSquare(x,y, stack) {


      var arr = [0, 1, 2, 3];

      shuffleArray4(arr);

      if(engineParameters.useGlobalDirection) {
        if(Math.random() < engineParameters.goToGlobalDirectionProbability) {
          for(var i = 0; i < arr.length; i++) {
            if(arr[i] === globalGrowingDirection) {
              arr[i] = arr[0];
              arr[0] = globalGrowingDirection;
              break;
            }
          }
        }
      }

      // try to go in that number of direction
      var numberDirection = 1;
      var rand = Math.random();
      if(rand > engineParameters.growProbabilities[1]) {
        numberDirection = 3;
      } else if(rand > engineParameters.growProbabilities[0]) {
        numberDirection = 2;
      }

      var success = 0;
      for(var i = 0; i < 4; i++) {
          var goCoord = directionsToCoordinates(x, y, arr[i])
          var hasGrown = tryToGrow(x, y, goCoord[0], goCoord[1], stack);
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

      // should we search in the current row or column first?
      var randRows = Math.random() > 0.5 ? true : false;

      if(randRows) {
        for(var i = 0; i < labyrinth.length; i++) {
            ic = ( i0 + randXDirection * i + labyrinth.length ) % labyrinth.length; // added the modulo value to make sure the result is > 0
            for(var j = 0; j < labyrinth[0].length; j++) {
                jc = ( j0 + randYDirection * j + labyrinth[0].length ) % labyrinth[0].length;

                if(labyrinth[ic][jc] === 0) {
                  var n = getNeighbours(ic,jc);
                  if(n.length > 0) {
                    return [ic, jc, n[0][0], n[0][1]];
                  }
                }
            }
        }
      } else {
        for(var j = 0; j < labyrinth[0].length; j++) {
            jc = ( j0 + randYDirection * j + labyrinth[0].length ) % labyrinth[0].length; // added the modulo value to make sure the result is > 0
            for(var i = 0; i < labyrinth.length; i++) {
                ic = ( i0 + randYDirection * i + labyrinth.length ) % labyrinth.length;

                if(labyrinth[ic][jc] === 0) {
                  var n = getNeighbours(ic,jc);
                  if(n.length > 0) {
                    return [ic, jc, n[0][0], n[0][1]];
                  }
                }
            }
        }
      }
      return false;
  }

  // 0, 1, 2, 3 (n, e, s, w)
  var globalGrowingDirection = Math.floor(Math.random() * 4);


  var generateMaze = function() {
    // stores the leafs to process;
    var stack = [];
    var start = [startPosition.x, startPosition.y];

    while(start) {
      stack.push([start[0], start[1]]);
      if(start.length === 4) {
        globalGrowingDirection = coordinatesToDirections(start[2], start[3], start[0], start[1]);

        labyrinth[start[0]][start[1]] = labyrinth[start[2]][start[3]] +1;
        diggWall(start[2],start[3], start[0],start[1]);
      } else {
        labyrinth[start[0]][start[1]] = 1;
      }

      while(stack.length > 0) {
        var leaf = stack.shift();
        growSquare(leaf[0], leaf[1], stack);
      }

      start = findNotHollowSquareWithHollowNeighboor();
    }
  }

  generateMaze();

  findEndPosition();

  var solution = findSolutionPath(startPosition, endPosition);

  return { labyrinth: labyrinth, labWallX: labWallX, labWallY: labWallY, maxDistance: maxDistance, startPosition: startPosition, endPosition: endPosition, solution : solution };

}