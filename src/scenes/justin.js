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

		this.debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
		this.debugKey.on("down", (key, event) => {
			// action
		});


		this.processInput(inputImageMatrix, 2);
	}

	// patternWidth = N (as in NxN)
	// populates necessary data structures for wfc core
	processInput(inputImageMatrix, patternWidth)
	{
		this.patterns = [];

		const inputWidth = inputImageMatrix.length;
		for (let y = 0; y < inputWidth; y++) {
			for (let x = 0; x < inputWidth; x++) {

				const pattern = [];
				for (let N = 0; N < patternWidth; N++) {
					pattern[N] = [];
					for (let N2 = 0; N2 < patternWidth; N2++) {
						pattern[N][N2] = 1;
					}
				}
				console.log(pattern);


			}
		}
	}
}

/*
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