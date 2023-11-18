title = "I Love Fishin";

description = `
`;

characters = [
`
llllll
 llll
  ll
`
];

const G = {
	WIDTH: 100,
	HEIGHT: 150
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

function update() {
  if (!ticks) {
    // Initialize objects
    boat = {
        pos: vec(10, 41)
    };
    bubbles = times(20, () => {
        const posX = rnd(0, G.WIDTH);
        const posY = rnd(50, G.HEIGHT);
        return {
            pos: vec(posX, posY),
            speed: rnd(0.5, 1.0)
        };
    });
  }
  //Spawn each bubble
  bubbles.forEach((b) => {
    b.pos.x += b.speed;
    // Bring the bubble back to left once it's past the right screen
    b.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
    color("light_blue");
    box(b.pos, 1);
    });
    // Draw water surface
    line(0, 45, 100, 45, 3);
    // Draw a boat
    color("black");
    char("a", boat.pos);

}