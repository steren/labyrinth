var canvas = document.getElementById('canvas');
var container = document.getElementById('container');

var computeAndDraw = function() {

  var renderParameters;
  var engineParameters;
  
  if(window.location.hash === '#colors') {
    
    document.body.style.background = 'black';

    engineParameters = {
      width: container.offsetWidth,
      height: container.offsetHeight
    }
    
    renderParameters = { 
      squareSize : 1, //px
      wallSize : 0,
      draw: {
        start : false,
        end : false,
        path : false
      },
      colorScheme : 'jet'
    };


  } else {

    var squareSize = 20; //px
    var wallSize = 8; //px

    var computedWidth = Math.floor(container.offsetWidth / (squareSize + wallSize));
    var computedHeight = Math.floor(container.offsetHeight / (squareSize + wallSize));

    /** Parameters needed to generate the maze */
    engineParameters = {
      width: computedWidth, //units
      height: computedHeight, //units
      startRandom: false,
      startPosition: {x:0, y:0}
    }

    /** Parameters needed to render the maze */
    renderParameters = {
      squareSize : squareSize,
      wallSize : wallSize,
      style: {
        backgroundColor: '#8e7763',
        squareColor: '#faf8ef',
        startColor: '#f2b179',
        endColor: '#edc22e',
        pathColor: 'rgb(238, 228, 218)'
      },
      draw: {
        start : 'arrow',
        end : 'circle'
      },
    };
  }
  






  var result = labyrinth(engineParameters)

  drawLabyrinth(canvas, renderParameters, result.labyrinth, result.labWallX, result.labWallY, result.startPosition, result.endPosition, result.solution, result.maxDistance);
}

window.onresize = computeAndDraw;

computeAndDraw();