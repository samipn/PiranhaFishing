title = "I Love Fishing";

description = `
Hold to cast,
release to
reel in
`;

characters = [
`
  RR
  yy
  yy
llllll
 llll
  ll
`,`
   G
G GGG
GGGGlG
GGGGGG
G GGG
   G
`,`
   r
r rrr
rrrrlr
rrrrrr
r rrr
   r
`,`
   P
P PPP
PPPPlP
PPPPPP
P PPP
   P
`
];

// Global constants
const G = {
	WIDTH: 100,
	HEIGHT: 150,

  ROD_LENGTH: 7,
  ROD_EXTEND_SPEED: 1.5,
  ROD_RETRACT_SPEED: 0.5,

  FISH_LEVELS: [70, 100, 130],
  FISH_MAX_DELTA_X: 40,
};

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT}
};

// Let bubbles be an array made of Bubble objects
/**
 * @typedef {{
 * pos: Vector,
 * speed: number
 * }} Bubble
 */

/**
 * @type { Bubble [] }
 */
let bubbles;

// Streams at the top of water
/**
 * @typedef {{
* pos: Vector,
* speed: number
* }} Stream
*/

/**
* @type { Bubble [] }
*/
let stream;

// Clouds in Sky
/**
 * @typedef {{
* pos: Vector,
* speed: number
* }} Clouds
*/

/**
* @type { Bubble [] }
*/
let clouds;

// Define a boat
/**
 * @typedef {{
 * pos: Vector
 * }} Boat
 */

/**
 * @type { Boat }
 */
let boat;
let turnaround = 2.5;

/** 
 * @typedef {{
 * angle: number,
 * length: number, 
 * end: Vector,
 * hook: Vector,
 * hasFish: boolean,
 * heldFish: Fish?
 * }} FishingRod 
 */

/** @type { FishingRod } */
let rod;

/**
 * @typedef {{
 * pos: Vector,
 * speed: number,
 * mirrored: 1 | -1,
 * sprite: string
 * }} Fish
 */

/** @type { Fish[] } */
let feesh;

function update() {
  // Init
  if (!ticks) {
    // Initialize objects
    boat = {
        pos: vec(10, 41)
    };

    rod = {
      angle: 0,
      length: G.ROD_LENGTH,
      end: vec(40, 20),
      hook: vec(40, 20).addWithAngle(0, G.ROD_LENGTH),
      hasFish: false,
      heldFish: null
    }
  
    bubbles = times(20, () => {
        const posX = rnd(0, G.WIDTH);
        const posY = rnd(50, G.HEIGHT);
        return {
            pos: vec(posX, posY),
            speed: rnd(0.3, .8)
        };
    });

    stream = times(7, () => {
      const posX = rnd(0, G.WIDTH);
      const posY = rnd(50, G.HEIGHT);
      return {
          pos: vec(posX, posY),
          speed: rnd(0.2, .4)
      };
    });

    clouds = times(3, () => {
      const posX = rnd(0, G.WIDTH);
      const posY = rnd(50, G.HEIGHT);
      return {
          pos: vec(posX, posY),
          speed: rnd(0.1, .2)
      };
    });

    feesh = [];
    feesh.push(makeFish("b", 0));
    feesh.push(makeFish("c", 1));
    feesh.push(makeFish("d", 2));
  }
  
  // Draw the scene
  drawScene();

  // Move and draw the fish
  feesh.forEach((f) => {

    if(f === rod.heldFish) {
      // Fish is caught
      // Set fish to the end of the rod
      f.pos.x = rod.hook.x;
      f.pos.y = rod.hook.y;
    } else {
      // Fish is free
      // Move the fish
      if(f.mirrored == -1) {
        f.pos.x -= f.speed;
        
        if(f.pos.x < (G.WIDTH / 2 - G.FISH_MAX_DELTA_X)) {
          f.mirrored = 1
        }
      } else {
        f.pos.x += f.speed;

        if(f.pos.x > (G.WIDTH / 2 + G.FISH_MAX_DELTA_X)) {
          f.mirrored = -1
        }
      }
    }

    // Draw the fish
    color("black");
    char(f.sprite, f.pos.x, f.pos.y, {mirror: {x: f.mirrored}});
  });
  
  //Input
  rod.hook = vec(rod.end).addWithAngle(rod.angle, rod.length);
  if(rod.hasFish) {
    // In fish get mode. Hold to stop in, release to reel in

    if(!input.isPressed){
      // Wire retract
      rod.length -= G.ROD_RETRACT_SPEED
    }

    // Check when wire is retracted
    if(rod.length <= G.ROD_LENGTH) {
        // Award the appropriate points
        if(rod.heldFish != null) {
          score += (rod.heldFish.speed * 8);
        }

        // Reset the line
        rod.heldFish.pos = vec(G.WIDTH / 2, G.FISH_LEVELS[(rod.heldFish.speed * 8) - 1]);
        rod.heldFish = null;
        rod.hasFish = false;
    }

    // Draw the rodWire (don't check for collisions in fish get mode)
    color("light_red");
    line(rod.end, vec(rod.end).addWithAngle(rod.angle, rod.length), 2)
  } else {
    // In fishing mode. Hold to extend, release to retract

    if (input.isPressed) {
      //Wire Extend
      rod.length += G.ROD_EXTEND_SPEED;
    } else {
      //Wire Retract
      rod.length += (G.ROD_LENGTH - rod.length) * 0.5;

      //Wire Swining
      if(rod.angle < turnaround) {
        turnaround = 2.5;
        rod.angle += 0.03;
      }
      else {
        turnaround = .3;
        rod.angle -= 0.03;
      }
      if(rod.angle >= 2.5 || rod.angle <= .3) {
        rod.length = 0;
      }
    }

    //Draw rodwire and check for collisions
    feesh.forEach((f) =>  checkFishCol(f));
  }
}

// Draw all scene (non-gameplay) components
function drawScene() {
  //Draw Sky
  color("light_blue");
  line(0, 0, 100, 0, 107);

  //Draw Sun
  color("yellow");

  //Draw Clouds
  box(70, 7, 7);

  // Draw water
  color("blue");
  line(0, 97, 100, 97, 107);

  //Spawn each bubble
  bubbles.forEach((b) => {
    b.pos.x += b.speed;
    // Bring the bubble back to left once it's past the right screen
    b.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
    color("light_blue");
    box(b.pos, 1, 1);
  });

  //spawn each stream
  stream.forEach((b) => {
    b.pos.x += b.speed;
    // Bring the Stream back to left once it's past the right screen
    b.pos.wrap(0, 100, 45, 50);
    color("white");
    box(b.pos, 3, 1);
  });

  clouds.forEach((b) => {
    b.pos.x += b.speed;
    // Bring the Clouds back to left once it's past the right screen
    b.pos.wrap(0, 100, 0, 20);
    color("white");
    box(b.pos, 8 , 3);
  });

  //draw rod handle
  color("light_yellow");
  line(12, 40, 40, 20, 2);
  // Draw a boat
  color("black");
  char("a", boat.pos);
}

/**
 * Draws the rodWire and checks if it hit the specified fish
 * @param { Fish } fish
 */
function checkFishCol(fish) {
  const SPRITE = fish.sprite;
  color("light_red");
  const isCollidingWithFish = line(rod.end, rod.hook, 2).isColliding.char[SPRITE];

  if(isCollidingWithFish) {
    rod.angle = rod.end.angleTo(fish.pos);
    rod.length = Math.sqrt((Math.pow(fish.pos.x - rod.end.x, 2) + (Math.pow(fish.pos.y - rod.end.y, 2))));
    if(input.isJustPressed) {
      rod.hasFish = true;
      rod.heldFish = fish;
      rod.angle = rod.end.angleTo(fish.pos);
      rod.length = Math.sqrt((Math.pow(fish.pos.x - rod.end.x, 2) + (Math.pow(fish.pos.y - rod.end.y, 2))));
    }
    else if (ticks >= 200){
      rod.hasFish = false;
      rod.heldFish = null;
      rod.length = 0;
      ticks = 0;
    }
    //rod.hasFish = true;
    //rod.heldFish = fish;
  }
}

/**
 * Creates a fish
 * @param {string} sprite 
 * @param {number} level 
 * @returns { Fish }
 */
function makeFish(sprite, level) {
  return {
    pos: vec(G.WIDTH / 2, G.FISH_LEVELS[level]),
    speed: (level + 1) / 8,
    mirrored: (rnd() < 0.5) ? -1 : 1,
    sprite: sprite
  }
}