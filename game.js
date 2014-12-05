
function startGame() {
  'use strict';

  var chart;
  var snakeSeries;
  var appleSeries;
  var scoreSeries;
  var boardSize = 20;
  var gameOver = false;
  var enlargeSnake = false;

  var direction = 'right';
  var nextDirection = direction;

  var speed = 200;
  var deltaSpeed = speed;

  var score = 0;

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function moveSnake(snake, direction, enlargeSnake) {
    var head = snake.data[snake.data.length - 1];
    var newPoint;
    switch (direction) {
      case 'right':
        newPoint = [head.x + 1, head.y];
        break;
      case 'left':
        newPoint = [head.x - 1, head.y];
        break;
      case 'up':
        newPoint = [head.x, head.y + 1];
        break;
      case 'down':
        newPoint = [head.x, head.y - 1];
        break;
    }

    snake.addPoint(newPoint, false, !enlargeSnake);

  }

  function inSnake(point, snake, startIndex) {
    var i;
    startIndex = startIndex || 0;
    for (i = startIndex; i < snake.data.length; i++) {
      if (point.x === snake.data[i].x && point.y === snake.data[i].y) {
        return true;
      }
    }

    return false;
  }


  function verifySnake(snake) {
    var i
    var point;
    for (i = 0; i < snake.data.length; i++) {
      point = snake.data[i];
      if (point.x < 0 || point.x > boardSize || point.y < 0 || point.y > boardSize || inSnake(point, snake, i + 1)) {
        return false;
      }
    }
    return true;
  }


  function createApple(apple, snake) {
    if (apple.data.length > 0) {
      return;
    }
    while (true) {
      var x = getRandomInt(0, boardSize + 1);
      var y = getRandomInt(0, boardSize + 1);
      if (!inSnake({ x: x, y: y }, snake)) {
        apple.addPoint([x, y]);
        return;
      }
    }
  }

  function verifyApple(apple, snake) {
    if (apple.data.length === 0) {
      return false;
    }

    if (inSnake(apple.data[0], snake)) {
      return true;
    }

    return false;
  }

  function MyGameState() {

    this.setup = function () {
      jaws.preventDefaultKeys(['up', 'down', 'left', 'right', 'space']);

      chart = new Highcharts.Chart({
        chart: {
          renderTo: 'container',
          type: 'scatter',
          animation: false
        },
        title: {
          text: 'High Snake'
        },
        xAxis: {
          min: 0,
          max: boardSize,
          tickInterval: 4
        },
        yAxis: {
          min: 0,
          max: boardSize,
          maxPadding: 0,
          minPadding: 0,
          tickInterval: 4,
          gridLineWidth: 0,
          title: {
            text: ''
          },
          lineWidth: 1,
          tickWidth: 1
        },
        plotOptions: {
          series: {
            lineWidth: 1
          }
        },
        tooltip: {
          enabled: false
        },

        series: [
          {
            name: 'Snake',
            data: [[1, boardSize / 2], [2, boardSize / 2], [3, boardSize / 2]]
          },
          {
            name: 'Apple',
            color: 'red',
            data: []
          },
          {
            name: 'Score: ' + score,
            data: [],
            color: 'blue'
          }
        ]

      });

      snakeSeries = chart.series[0];
      appleSeries = chart.series[1];
      scoreSeries = chart.series[2];
    };


    this.update = function () {
      if (gameOver) {
        return;
      }
      if (jaws.pressed('left')) {
        if (direction === 'up' || direction === 'down') {
          nextDirection = 'left';
        }
      } else if (jaws.pressed('right')) {
        if (direction === 'up' || direction === 'down') {
          nextDirection = 'right';
        }
      } else if (jaws.pressed('up')) {
        if (direction === 'left' || direction === 'right') {
          nextDirection = 'up';
        }
      } else if (jaws.pressed('down')) {
        if (direction === 'left' || direction === 'right') {
          nextDirection = 'down';
        }
      }


      createApple(appleSeries, snakeSeries);
      deltaSpeed -= jaws.game_loop.tick_duration;
      if (deltaSpeed <= 0) {
        deltaSpeed = speed;
        moveSnake(snakeSeries, nextDirection, enlargeSnake);
        if (!verifySnake(snakeSeries)) {
          gameOver = true;
          chart.showLoading();
        }
        enlargeSnake = false;
        if (verifyApple(appleSeries, snakeSeries)) {
          score++;
          scoreSeries.update({ name: 'Score: ' + score })
          appleSeries.setData([], false);
          enlargeSnake = true;
        }
        direction = nextDirection;
      }

    };


    this.draw = function () {
      chart.redraw();
    };
  }

  Highcharts.setOptions({
    lang: {
      loading: 'Game Over! Refresh the browser to start again.'
    }
  })
  jaws.start(MyGameState);
}