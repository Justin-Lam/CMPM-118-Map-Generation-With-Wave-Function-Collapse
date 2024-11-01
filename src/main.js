// debug with extreme prejudice
"use strict"

// Game Config:
let config = {
	parent: "phaser-game",
	type: Phaser.CANVAS,
	width: OUTPUT_MAP_WIDTH * TILE_WIDTH,
	height: OUTPUT_MAP_WIDTH * TILE_WIDTH,
	zoom: 0.5,
	autoCenter: true,
	render: {
		pixelArt: true 		// prevent pixel art from getting blurred when scaled
	},
	scene: [Justin, Blythe, Michelle, MapGen]
}

// Game:
const game = new Phaser.Game(config);