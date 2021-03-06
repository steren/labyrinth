function drawLabyrinth(canvasElement, parameters, matrix, matrixWallX, matrixWallY, startPosition , endPosition, solution, maxDistance) {

    /** Parameters needed to render the maze */
    var defaultParameters = { 
      squareSize : 20, //px
      wallSize : 8, //px
      style: {
        backgroundColor: '#000',
        squareColor: '#fff',
        startColor: '#00f',
        endColor: '#0f0',
        pathColor: '#aaf'
      },
      draw: {
        start : true,
        end : true,
        path : false
      },
      drawingTiming : 0,
      colorScheme : false //defaut to squareColor, possible values : 'hue', 'nanette', 'luminosity', 'icedmint', fire
    };
    
    _.defaults(parameters, defaultParameters);

    var width = matrix.length;
    var height = matrix[0].length;

    function getColor(value) {
      if(!parameters.colorScheme) {
        return parameters.style.squareColor;
      }
      var h,l,s;
      switch(parameters.colorScheme) {
        case 'jet':
          h = Math.floor(value / maxDistance * 360);
          s = 100;
          l = 70;
          break;
        case 'luminosity':
          h = 0;
          s = 70;
          l = Math.floor(100 * value / maxDistance);
          break;
        case 'nanette':
          h = 240 + Math.floor(120 * value / maxDistance);
          s = 100;
          l = Math.floor(100 * value / maxDistance);
          break;
        case 'fire':
          h = - 30 + Math.floor(120 * value / maxDistance);
          s = 100;
          l = Math.floor(100 * value / maxDistance);
          break;
        case 'icedmint':
          var periods = 3;
          h = 180;
          s = 100;
          l = Math.floor( 50 +  50 * Math.sin( periods * 2 * Math.PI * value / maxDistance));
          break;
      }
      return 'hsl('+ h +', '+ s + '%, ' + l + '%)';
    }

    canvas.width = width * ( parameters.squareSize + parameters.wallSize ) + parameters.wallSize;
    canvas.height = height * ( parameters.squareSize + parameters.wallSize ) + parameters.wallSize;

    var ctx = canvas.getContext('2d');

    function getDrawingFunction(draw) {
        if(draw === 'circle') {
            return drawCircle;
        } else if(draw === 'arrow') {
            return drawArrow;
        } else {
            return drawSquare;
        }
    }

    function drawSquare(x,y) {
      ctx.fillRect(parameters.wallSize + x * ( parameters.squareSize + parameters.wallSize),
          parameters.wallSize + y * ( parameters.squareSize + parameters.wallSize),
          parameters.squareSize,
          parameters.squareSize);
    };

    function drawArrow(x, y) {
      var originX = parameters.wallSize + x * ( parameters.squareSize + parameters.wallSize);
      var originY = parameters.wallSize + y * ( parameters.squareSize + parameters.wallSize);
      ctx.beginPath();
      ctx.moveTo(originX + parameters.squareSize * 3 / 4, originY + parameters.squareSize * 3 / 4);
      ctx.lineTo(originX + parameters.squareSize  * 3 / 4, originY);
      ctx.lineTo(originX, originY + parameters.squareSize  * 3 / 4);
      ctx.fill();
    }
    
    function drawCircle(x, y) {
      ctx.beginPath();
      ctx.arc(parameters.wallSize + x * ( parameters.squareSize + parameters.wallSize) + parameters.squareSize / 2,
        parameters.wallSize + y * ( parameters.squareSize + parameters.wallSize)  + parameters.squareSize / 2,
        parameters.squareSize / 2, 0, 2 * Math.PI, false);
      ctx.fill();
    }

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
      for(var i = 0; i < solution.length; i++) {
         drawSquare(solution[i][0], solution[i][1]);
         if(i > 0) {
           drawWallBetween(solution[i-1][0], solution[i-1][1], solution[i][0], solution[i][1])
         }
      }
    }

    if(parameters.draw.start) {
      ctx.fillStyle = parameters.style.startColor;
      var drawingFunc = getDrawingFunction(parameters.draw.start);
      drawingFunc(startPosition.x, startPosition.y);
    }

    if(parameters.draw.end) {
      ctx.fillStyle = parameters.style.endColor;
      var drawingFunc = getDrawingFunction(parameters.draw.end);
      drawingFunc(endPosition[0], endPosition[1]);
    }

  }