window.addEventListener("gamepadconnected", function(e) {
  var gp = navigator.getGamepads()[e.gamepad.index];
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
  gp.index, gp.id,
  gp.buttons.length, gp.axes.length);
});

function buttonPressed(b) {
  if (typeof(b) == "object") {
    return b.pressed;
  }
  return b == 1.0;
}

function getAxis(axis, deadZone){
	if (axis > -deadZone && axis < deadZone) axis = 0.0;
	return  axis;
}

Crafty.init(800,600, document.getElementById('game'));

function genPaddle(jNum, px){
	Crafty.e('Paddle, 2D, Canvas, Color, Collision')
	  .attr({x: px, y: 100, w: 10, h: 80, joyNum: jNum, speed: 6, flickerTime: 0, flicker: false, btnTime : 0})
	  .color('#fff')
	  .bind("EnterFrame", function() {	
		//poll the gamepad this paddle uses
		var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
		var joypad = null;
		if(gamepads.length > this.joyNum) joypad = gamepads[this.joyNum];
	  
		if(joypad != null){	
			if(joypad.axes.length >= 2){
				var yAxis = getAxis(joypad.axes[1], 0.5);
				
				if(yAxis != 0){
					this.shift(0, yAxis * this.speed,0,0);
					
					if(this.y < 0) this.y = 0;
					if(this.y + this.h > 600) this.y = 600 - this.h;
				}
			}		
			
			//button 2 is only on there so my RetroLink GCN controller cause use the 'A' button.
			if(buttonPressed(joypad.buttons[2]) || buttonPressed(joypad.buttons[0])){ 
				this.btnTime++;
			}
			else{
				this.btnTime = 0;
			}
		}
		
		//if the flicker flag isn't on draw the paddle normally
		if(!this.flicker){
			if(this.btnTime > 0 && this.btnTime < 10) this.color('#f00');
			else this.color('#fff');
		}
		
		//if the flicker flag is on make the paddle invisible
		if(this.flickerTime > 0){ 
			if(this.flicker) this.color('#000');
			this.flicker = !this.flicker;
			this.flickerTime--;
			if(this.flickerTime <= 0) this.flicker = false;
		}
	});
}

genPaddle(0, 130);
genPaddle(1, 660);

Crafty.e("Ball, 2D, DOM, Color, Collision")
	.color('#00f')
	.attr({ x: 300, y: 150, w: 10, h: 10, 
			dX: Crafty.math.randomInt(2, 5), 
			dY: Crafty.math.randomInt(2, 5),
			colorNum: 0	})
	.bind('EnterFrame', function () {
		
		//if the ball isn't red make it flash cool colors
		if(this.colorNum != 9){
			this.colorNum++;
			switch(this.colorNum){
				case 0:
					this.color('#00f');
				break;
				
				case 1:
					this.color('#0ff');
				break;
				
				case 2:
					this.color('#0f0');
				break;
				
				case 3:
					this.color('#ff0');
				break;
				
				case 4:
					this.color('#f0f');
				break;
			}
			
			if(this.colorNum >= 4) this.colorNum = 0;
		}
	
		
		if (this.x >= 790){
			Crafty("LeftPoints").each(function () { 
				this.text(++this.points + " Points") });
			this.x = 400;	
		}
		if(this.x <= 0){
			Crafty("RightPoints").each(function () { 
				this.text(++this.points + " Points") });
			this.x = 400;	
		}
			
		//hit floor or roof
		if (this.y <= 0 || this.y >= 590){
			this.dY *= -1;
		}

		var speed = 1.5;
		this.x += this.dX * speed;
		this.y += this.dY * speed;;
	})
	.onHit('Paddle', function (ent) {
	
	//get the paddle that was hit
	var paddle = ent[0].obj;
	if(paddle.flickerTime <= 0){	
		if(paddle.btnTime > 0 && paddle.btnTime < 10){
			this.color("#f00");
			this.colorNum = 9;
		}
		
		else{
			if(this.color() == "#f00"){
				paddle.flickerTime = 35;
			}
			this.colorNum = 0;
		}
		
		if(paddle.flickerTime <= 0) this.dX *= -1;
	}
})

Crafty.e("LeftPoints, DOM, 2D, Text")
	.attr({ x: 20, y: 20, w: 100, h: 20, points: 0})
	.text("No Points").textFont({ size: '20px', weight: 'bold' });;
	
Crafty.e("RightPoints, DOM, 2D, Text")
	.attr({ x: 680, y: 20, w: 100, h: 20, points: 0})
	.text("No Points").textFont({ size: '20px', weight: 'bold' });;