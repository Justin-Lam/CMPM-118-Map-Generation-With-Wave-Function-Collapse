class Justin extends Phaser.Scene
{
	constructor() {
		super("justinScene");
	}

	preload()
	{
		this.load.path = './assets/';
		this.load.image("map pack", "mapPack_spritesheet.png");
	}

	create()
	{
		const inputImageMatrix = [
			[WATER,		WATER,		WATER],
			[SAND_C,	SAND_C,		WATER],
			[GRASS_C,	GRASS_C,	SAND_C]
		];

		const map = this.make.tilemap({
			data: inputImageMatrix,
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_WIDTH
		});
		const tileset = map.addTilesetImage("map pack");
		const layer = map.createLayer(0, tileset, 0, 0);

		let patternMap = null;
		let i = 0;
		this.debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
		this.debugKey.on("down", (key, event) => {

			if (i+1 > this.patterns.length-1) {
				console.log("no more patterns to see");
				return;
			}
			i++;

			if (patternMap) {
				patternMap.destroy();
			}

			patternMap = this.make.tilemap({
				data: this.patterns[i],
				tileWidth: TILE_WIDTH,
				tileHeight: TILE_WIDTH
			});
			const patternLayer = patternMap.createLayer(0, tileset, TILE_WIDTH*4, 0);
		});


		this.processInput(inputImageMatrix, 3);

		patternMap = this.make.tilemap({
			data: this.patterns[i],
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_WIDTH
		});
		const patternLayer = patternMap.createLayer(0, tileset, TILE_WIDTH*4, 0);
	}

	// patternWidth = N (as in NxN)
	// populates necessary data structures for wfc core
	processInput(inputImageMatrix, patternWidth)
	{
		if (patternWidth < 1) {
			throw new Error("Pattern width is less than or equal to 0. Can't have a pattern made of 0x0, (-1)x(-1) tiles, etc!");
		}
		if (patternWidth > inputImageMatrix.length) {
			throw new Error("Pattern width is greater than input image width. Can't have a image made of patterns that are larger than it!");
		}

		this.patterns = [];

		const inputWidth = inputImageMatrix.length;
		for (let y = 0; y < inputWidth; y++) {
			for (let x = 0; x < inputWidth; x++) {

				const pattern = [];
				// Nx x Ny = NxN
				for (let Ny = 0; Ny < patternWidth; Ny++) {
					pattern[Ny] = [];
					for (let Nx = 0; Nx < patternWidth; Nx++) {
						pattern[Ny][Nx] = inputImageMatrix[(y + Ny) % inputWidth][(x + Nx) % inputWidth];
					}
				}
				this.patterns.push(pattern);

			}
		}
	}
}

/*
if (axis < 0)           // move down in the array
{
	currentIndex = (currentIndex - 1 + gameObjects.Length) % gameObjects.Length;        // relearned this pattern from https://banjocode.com/post/javascript/iterate-array-with-modulo
}
else if (axis > 0)      // move up in the array
{
	currentIndex = (currentIndex + 1) % gameObjects.Length;
}

potential design for pattern data structure?
let pattern = {
	num: 0,
	tiles: [
		[],
		[]
		// can be 2 or 3 or even more
	],
	weight: 1
}
*/