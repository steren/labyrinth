var canvas = document.getElementById('canvas');

/** Parameters needed to generate the maze */
var engineParameters = {}

/** Parameters needed to render the maze */
var renderParameters = {};


var renderArtParameters = { 
  squareSize : 1, //px
  wallSize : 0,
  draw: {
    start : false,
    end : false,
    path : false
  },
  colorScheme : 'jet'
};

var result = labyrinth(engineParameters)

drawLabyrinth(canvas, renderParameters, result.labyrinth, result.labWallX, result.labWallY, result.startPosition, result.endPosition, result.solution, result.maxDistance);

