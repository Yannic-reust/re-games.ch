function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === 'undefined') {
    stroke = true
  }

  if (typeof radius === 'undefined') {
    radius = 5
  }

  if (typeof radius === 'number') {
    radius = {
      tl: radius,
      tr: radius,
      br: radius,
      bl: radius
    }
  } else {
    var defaultRadius = {
      tl: 0,
      tr: 0,
      br: 0,
      bl: 0
    }
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side]
    }
  }

  ctx.beginPath()
  ctx.moveTo(x + radius.tl, y)
  ctx.lineTo(x + width - radius.tr, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
  ctx.lineTo(x + width, y + height - radius.br)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
  ctx.lineTo(x + radius.bl, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
  ctx.lineTo(x, y + radius.tl)
  ctx.quadraticCurveTo(x, y, x + radius.tl, y)
  ctx.closePath()

  if (fill) {
    ctx.fill()
  }

  if (stroke) {
    ctx.stroke()
  }
}

function UIObject(width, height, color, x, y, type) {
  this.type = type
  this.width = width
  this.height = height
  this.speedX = 0
  this.speedY = 0
  this.x = x
  this.y = y
  this.isDragging = false
  this.degrees = 0
  this.color = color
  this.text = undefined

  this.update = function () {
    var ctx = game.context

    if (this.type === 'text' || this.type === 'text-no') {
      ctx.font = this.width + ' ' + this.height
      ctx.fillStyle = this.color
      if (this.type === 'text') {
        ctx.textAlign = 'center'
      } else {
        ctx.textAlign = 'left'
      }
      ctx.fillText(this.text, this.x, this.y)
    } else {
      if (this.type === 'image') {
        var img = new Image()
        img.src = this.color
        ctx.drawImage(img, this.x, this.y, this.width, this.height)
      } else {
        ctx.fillStyle = this.color
        if (this.type === 'circle') {
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.width - 5, 0, 2 * Math.PI)
          ctx.fill()
        } else {
          if (this.type === 'nofill-circle') {
            ctx.strokeStyle = color
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.width - 5, 0, 2 * Math.PI)
            ctx.stroke()
          } else {
            if (this.type === 'rounded') {
              ctx.strokeStyle = 'rgb(128, 128, 128)'
              ctx.fillStyle = this.color
              roundRect(ctx, this.x, this.y, this.width, this.height, 20, true)
            } else {
              ctx.save()
              ctx.translate(this.x + this.width / 2, this.y + this.height / 2)
              ctx.rotate(this.degrees * Math.PI / 180)
              ctx.beginPath()
              ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
              ctx.restore()
            }
          }
        }
      }
    }
  }

  this.updatePos = function (gravity) {
    this.speedY -= -gravity;
    this.x += this.speedX
    this.y += this.speedY
  }

  this.checkcollide = function (other) {
    var thiscenterx = this.x + (this.width / 2)
    var thiscentery = this.y + (this.height / 2)

    var othercenterx = other.x + (other.width / 2)
    var othercentery = other.y + (other.height / 2)

    var w = 1 / 2 * (this.width + other.width)
    var h = 1 / 2 * (this.height + other.height)

    var dx = thiscenterx - othercenterx
    var dy = thiscentery - othercentery

    if (Math.abs(dx) <= w && Math.abs(dy) <= h) {
      var xx = h * dx
      var yy = w * dy

      if (yy > xx) {
        if (yy > -xx) {
          return 1 /* top */
        } else {
          return 2
        } /* left */
      } else {
        if (yy > -xx) {
          return 3 /* right */
        } else {
          return 4
        } /* bottom */
      }
    }

    return 0
  }
}

var game;

function start() {
  game = {
    canvas: document.createElement('canvas'),
    start: function () {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight - 5
      this.context = this.canvas.getContext('2d')
      document.body.insertBefore(this.canvas, document.body.childNodes[0])
      this.frameNo = 0
      this.interval = setInterval(update, 15)
    },

    stop: function () {
      obstacles = [];
      score = 0;
      speed = 1.5;
      player = new UIObject(30, 30, "red", 10, 120);
    },

    clear: function () {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  player = new UIObject(30, 30, "red", 10, 120);
  text = new UIObject('160px', 'customFont', 'rgb(0, 0, 0)', 60, 130, 'text');

  game.start();

  document.onmousedown = function() { up(); };

  document.onkeypress = function() { up(); };

  window.onresize = windowResize
}

function up() {
  player.speedY = -3;
}

function windowResize() {
  game.canvas.width = window.innerWidth;
  game.canvas.height = window.innerHeight - 5;
}

var player;
var obstacles = [];
var score = 0;
var text;
var speed = 1.5;
var scoreAdd = 0;

function update() {
  var x, height, gap, minHeight, maxHeight, minGap, maxGap;

  for (i = 0; i < obstacles.length; i += 1) {
    if (player.checkcollide(obstacles[i])) {
      game.stop();
      return;
    }

    if (player.x > obstacles[i].x) {
      scoreAdd++;

      if (scoreAdd == 2) {
        score++;
        scoreAdd = 0;
      }

      obstacles.splice(i, 1);
    }
  }

  if (player.y < 0) {
    player.y = game.canvas.height - 10;
  } else {
    if (player.y > game.canvas.height) {
      player.y = 10;
    }
  }

  game.clear();
  game.frameNo += 1;

  if (game.frameNo == 1 || everyinterval(150)) {
    x = game.canvas.width;

    minHeight = 20;
    maxHeight = 200;

    height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);

    minGap = 80;
    maxGap = 300;

    gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);

    obstacles.push(new UIObject(30, height, "green", x, 0));
    obstacles.push(new UIObject(30, x - height - gap, "green", x, height + gap));
  }

  for (i = 0; i < obstacles.length; i += 1) {
    obstacles[i].x -= speed;
    obstacles[i].update();
  }

  player.updatePos(0.06);
  player.update();

  text.text = score;
  text.update();
  
  speed += 0.0001;
}

function everyinterval(n) {
  if ((game.frameNo / n) % 1 == 0) {
    return true;
  }
  return false;
}