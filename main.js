/*
Leon vk.com/leon_bigbon

  (\____/)
    ( ͡° ͜ ʖ ͡°)
   \╭☞ \╭☞

 (∩｀-´)⊃━☆ﾟ.*･｡ﾟ
*/
//if u r here feel free to play with the code
//especially if u can solve the issue with the blur not working propely after the game finishes
//location: Scene.finish()

var bar, ball, myScene;
var gameStarted = false;
var sounds = {
  popsound: null
};

//may be put in Scene constructor
var fr = 0;
var frAv = 0;

//DOM stuff
var DOMelts = {};



function preload() {
  soundFormats('mp3', 'ogg');
  sounds.popsound = loadSound('res/comedy_pop_mouth_finger_001.mp3', () => console.log('Sound loaded'), () => console.log('Unable to load sound'));

}

function setup() {
  if (displayWidth >= displayHeight) {
    createCanvas(400, 400);
  } else {
    createCanvas(windowWidth, windowWidth);
  }

  background(100);
  noStroke();
  textSize(26);
  textAlign(CENTER);
  //text('DOUBLE CLICK TO START\nOR THREE FINGER TOUCH', width * 0.5, height * 0.5);
  createDOM();
  setInterval(() => {
    frAv = fr / 5;
    fr = 0
  }, 5000);


}

function draw() {

  if (gameStarted) {
    //MANAGING CONTROLES
    if (touches.length == 0) {
      if (keyIsDown(LEFT_ARROW)) {
        bar.vel = createVector(-bar.Mvel, 0);
      } else if (keyIsDown(RIGHT_ARROW)) {
        bar.vel = createVector(bar.Mvel, 0);
      } else {
        bar.vel = createVector(0, 0);
      }
    } else {
      myTouchStarted()
    }

    //default BG
    background(100);

    myScene.show();
    ball.update();
    //DEBUG
    //ball.pos.x = mouseX;
    //ball.pos.y = mouseY;
    bar.update();
    bar.show();
    ball.show();
    myScene.update();
    //console.log(ball.vel.toString());
    text(floor(frameRate()), 50, 50);
    text(myScene.bricksDestroyed, 50, 100);
  }

  fr++;
  text(frAv, 50, 150);
  //createDOM();

}

function Scene(num_ = 4, color_ = color('green')) {
  //Scene constructor
  this.bricks = [];
  this.bricksDestroyed = 0;
  this.completed = false;
  this.hp = 1;
  this.loose = false;

  this.brickWidth = 60;
  this.brickHeight = 40;
  this.bg = color_;
  for (let i = 0; i < num_; i++) {
    this.bricks.push(new Brick(i * (this.brickWidth) % width, floor(i * (this.brickWidth) / width) * this.brickHeight + 8, getRandomColor('DARK')));
  }
  this.brickCornerHeading = createVector(this.brickWidth * 0.5, this.brickHeight * 0.5).heading();

  this.show = function() {
    background(this.bg);
    //console.log('showing');
    push();
    //fill("red");
    //strokeWeight(2);
    //stroke(0);
    this.bricks.forEach((el) => el.show());
    pop();
  };

  this.update = function() {
    //deleting collided bricks
    //console.log(this.bricks.length);
    let detbricks = 0;
    for (let i = this.bricks.length - 1; i >= 0; i--) {
      //console.log('searching');
      //console.log(temp);
      //there can not be more then 2 collisions at one time (to be exact there cannot be even 2 in the real world)
      //set to 1 because 2 caused wierd bounces
      if (detbricks == 1) break;
      if (this.bricks[i].checkCollision()) {
        console.log('collision detected');
        sounds.popsound.play();

        detbricks++;


        let vec = createVector(ball.pos.x - (this.bricks[i].pos.x + myScene.brickWidth * 0.5), ball.pos.y - (this.bricks[i].pos.y + myScene.brickHeight * 0.5)).heading();
        if (vec > -myScene.brickCornerHeading && vec < myScene.brickCornerHeading) {
          ball.vel.x *= -1;
        } else if (vec > myScene.brickCornerHeading && vec < PI - myScene.brickCornerHeading) {
          ball.vel.y *= -1;
        } else if (vec > -PI + myScene.brickCornerHeading && vec < -myScene.brickCornerHeading) {
          ball.vel.y *= -1;
        } else {
          ball.vel.x *= -1;
        }

        this.bricks.splice(i, 1);
        myScene.bricksDestroyed++;
        console.log("brick deleted");
      }
    }
    if (this.bricks.length == 0) {
      this.completed = true;
      this.loose = false;
      this.finish();
      console.log('from update', this.completed);
    }
  };

  this.finish = function() {

    //filter(INVERT);
    noLoop();
    if (this.completed === true) {
      //win state
      console.log(this.completed, 'you win');
      text('GREAT JOB M8!', width * 0.5, height * 0.5);
    } else {
      //loose state
      console.log(this.completed, 'you loose');
      ellipse(300, 300, 300);
      text('LOOOOOSER', width * 0.5, height * 0.5);
    }
    //redraw();
    //filter(BLUR, 3);
    //imgBg = createImage(width, height);
    /*saveFrames('out', 'png', 1, 1, function(data) {
			imgBg = data[0];
  		print(data);
		});*/


    Object.keys(DOMelts).forEach((arg) => DOMelts[arg].show());
  };
}

function Brick(x_, y_, c_ = color("white")) {
  //brick constructor
  this.pos = createVector(x_, y_);
  this.c = c_;

  this.show = function() {
    push();
    fill(this.c);
    //strokeWeight(2);
    //stroke(0);
    rect(this.pos.x, this.pos.y, myScene.brickWidth, myScene.brickHeight, 4);
    pop();
  }

  this.checkCollision = function() {
    return ball.pos.x + ball.r >= this.pos.x && ball.pos.x - ball.r <= this.pos.x + myScene.brickWidth && ball.pos.y + ball.r >= this.pos.y && ball.pos.y - ball.r <= this.pos.y + myScene.brickHeight;
  }
}

function Bar(x_ = 0, y_ = 100, w_ = 50, h_ = 10, Mvel_ = 5) {
  //player bar constructor
  this.pos = createVector(x_, y_);
  this.w = w_;
  this.h = h_;
  this.Mvel = Mvel_;
  this.vel = createVector(0, 0);
  this.offset = this.w * 0.25;


  this.show = function() {
    rect(this.pos.x, this.pos.y, this.w, this.h, 4);
    push();
    stroke(2);
    //lines of different bar parts
    line(this.pos.x + this.offset, this.pos.y, this.pos.x + this.offset, this.pos.y + this.h);
    line(this.pos.x + this.w - this.offset, this.pos.y, this.pos.x + this.w - this.offset, this.pos.y + this.h);
    pop();
  }

  this.update = function() {
    if (this.pos.x > 0 && this.vel.x < 0) {
      this.pos.add(this.vel);
    } else if (this.pos.x + this.w + 4 < width && this.vel.x > 0) {
      this.pos.add(this.vel);
    } else {

    }
  }
}

function Ball(x_ = width * 0.5, y_ = height * 0.5 - 40, r_ = 10, vel_ = createVector(0, 2)) {
  //ball constructor
  this.pos = createVector(x_, y_);
  this.r = r_;
  this.vel = vel_;
  this.Mvel = 5;
  this.col = color(DOMelts.colorIn.value()) || color('white');
  this.tailCol = this.col;
  this.tailCol.setAlpha(100);

  //previous pos for tail drawing
  this.pPos = this.pos;
  this.tOffset = 10;
  this.trace = [];
  this.frameDelta = 2;

  this.update = function() {
    //this.pos.add(this.vel);

    //COLLISION STATE
    if (this.pos.y + this.r - 2 >= bar.pos.y && this.pos.x + this.r > bar.pos.x && this.pos.x - this.r < bar.pos.x + bar.w && this.pos.y < bar.pos.y) {
      if (bar.vel.x != 0) {
        //MOVING CASE
        //this.vel = createVector(map(bar.vel.x, -bar.Mvel, bar.Mvel, -0.7, 0.7), -1);
        this.vel = p5.Vector.fromAngle(map(bar.vel.x, -bar.Mvel, bar.Mvel, -PI + 1, -1) + random(-0.2, 0.2), this.Mvel);
        //console.log(map(bar.vel.x, -bar.Mvel, bar.Mvel, PI - 1, 1));
      } else {
        //STATIC CASES
        if (this.pos.x < bar.pos.x + bar.offset) {
          // LEFT PART CASE
          //this.vel = createVector(map(this.pos.x - bar.pos.x, 0 , bar.offset, -0.7, 0), -1);
          this.vel = p5.Vector.fromAngle(map(this.pos.x - bar.pos.x, 0, bar.offset, -PI + 0.5, -HALF_PI), this.Mvel);
        } else if (this.pos.x > bar.pos.x + bar.w - bar.offset) {
          //RIGHT PART CASE
          //this.vel = createVector(map(bar.pos.x + bar.w - this.pos.x, bar.offset , 0, 0, 0.7), -1);
          this.vel = p5.Vector.fromAngle(map(bar.pos.x + bar.w - this.pos.x, bar.offset, 0, -HALF_PI, -0.5), this.Mvel);
        } else {
          //MIDDLE CASE
          this.vel = p5.Vector.fromAngle(map(this.vel.heading() * (-1), -3 * QUARTER_PI, -QUARTER_PI, -0.66 * PI, -0.33 * PI) + random(-0.2, 0.2), this.Mvel);
        }
      }
      sounds.popsound.play();
    }
    //BONDARIES
    if (this.pos.y - this.r <= 0) {
      this.vel.y *= -1;
    }
    //bottom boudary (for debug/testing purpuses)
    if (this.pos.y >= height) {
      this.vel.y *= -1;
      //fill(0);
      myScene.hp--;
      if (myScene.hp == 0) {
        myScene.loose = true;
        myScene.finish();
      }
    }
    if (this.pos.x - this.r <= 0) {
      this.vel.x *= -1;
    }
    if (this.pos.x + this.r >= width) {
      this.vel.x *= -1;
    }
    //sounds.popsound.play();
    //making trace
    //this.pPos = this.pos.copy();
    if (this.frameDelta-- == 0) {
      this.trace.push(this.pos.x);
      this.trace.push(this.pos.y);
      this.frameDelta = 3;
    }
    //applying new velocity to pos
    this.pos.add(this.vel);

    //this.tOffset--;
    //if(this.tOffset==0) {
    //
    //}

  }

  this.show = function() {
    push();
    fill(this.col)
    ellipse(this.pos.x, this.pos.y, this.r * 2);
    stroke('magenta');
    //line(this.pos.x, this.pos.y, (this.vel.x *(-10) + this.pos.x), (this.vel.y *(-10) + this.pos.y));
    fill(this.tailCol);
    noStroke(0);
    for (let i = 0; i < this.trace.length; i += 2) {
      ellipse(this.trace[i], this.trace[i + 1], i + 2);
    }
    if (this.trace.length > this.tOffset) this.trace.splice(0, 2);
    //fill(255, 100);
    //triangle((this.vel.x *(-10) + this.pos.x), (this.vel.y *(-10) + this.pos.y), this.pos.x + 50, this.pos.y + 20, this.pos.x - 50, this.pos.y + 20)
    pop();
  }
}

//not serious
var k = 10;

function startGame() {
  Object.keys(DOMelts).forEach((arg) => DOMelts[arg].hide()); //DOMelts.arg.hide());
  //for(let arg of DOMelts) {
  //	arg.hide();
  //}
  gameStarted = true;
  bar = new Bar(width * 0.5, height - 50, 100, undefined);
  ball = new Ball();
  ball.col = DOMelts.colorIn.value();
  myScene = new Scene(k++, getRandomColor('LIGHT'));
  loop();
  return false;
}

/**
 * @description Returns light or dark color
 * @param {string} arg 
 * @returns {object} p5.Color object
 */
function getRandomColor(arg) {
  let col;
  push()
  colorMode(HSB);
  if (arg == 'LIGHT') {
    col = color(random(360), 40, 100);
  } else if (arg == 'DARK') {
    col = color(random(360), 100, 70);
  } else {
    col = color(random(360), 100, 100);
  }
  pop();
  return col;
}

function createDOM() {
  //color input
  DOMelts['colorIn'] = createInput("#e66465", "color")
    .position(50, 50);

  //JS is just unexplainable but awesome
  //console.log(DOMelts.colorIn, DOMelts['colorIn']);
  console.log(DOMelts.colorIn.value())

  //Start button
  DOMelts['startButton'] = createButton("Start")
    .size(width * 0.33, width * 0.15)
    .position(width * 0.5, height * 0.8)
    .center('horizontal')
    .mousePressed(startGame);


  //colorIn.attribute('hidden','false')
  console.log(DOMelts.colorIn.style("display"));
  //console.log('ColorIn created');
}

//mouse pressed added because if absent event Listener awokes built-in function: touchStarted()


function myTouchStarted() {
  if (touches[0].x > width * 0.5) {
    //myScene.bg = getRandomColor('LIGHT');
    bar.vel = createVector(bar.Mvel, 0);
  } else {
    bar.vel = createVector(-bar.Mvel, 0);
  }
  return false;
}

//Dont need them yet ¯\_(ツ)_/¯
function touchStarted() {
  //prevent default
  return false;
}

function mousePressed() {
  //prevent default
  return false;
}

function doubleClicked() {
  //prevent default
  return false;
}
