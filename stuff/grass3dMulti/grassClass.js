function Grass(_x, _y, _z) {
  this.x = _x;
  this.y = _y;
  this.z = _z;
  this.kickTime = [];
  this.kicked = false;

  this.ampScale = 0;
  this.phase = TWO_PI * 9999;

  this.kick = function(_kickTime) {
    this.kickTime.push(_kickTime);
  };


  this.move = function(deltaPhase, currentTime) {
    while (this.kickTime.length > 0) {
      if (currentTime >= this.kickTime[0]) {
        this.kicked = true;
        this.kickTime.shift();
      } else {
        break;
      }
    }

    var angle = this.ampScale * sin(this.phase);
    var speed = cos(this.phase);
    var canKick = false;
    if (abs(angle) < .15 * 0.1) {
      if (this.ampScale < .15 * 0.2) {
        canKick = true;
      } else if (speed > 0) {
        canKick = true
      }
    }

    if (this.kicked && canKick) {
      this.phase = 0;
      this.kicked = false;
    } else {
      this.phase += deltaPhase;
      this.ampScale = 0.15 * (1 - this.phase / (6 * TWO_PI));
      if (this.ampScale < 0) this.ampScale = 0;
    }
  };

  this.display = function() {
    push();
    translate(this.x, this.y, this.z);
    translate(0, 16, 0);
    rotateX(this.ampScale * sin(this.phase));
    box(3, 2, 3);
    translate(0, -16, 0);
    cylinder(1, 48, 6, 2); //r,height
    pop();
  }
};