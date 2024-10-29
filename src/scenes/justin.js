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
		// test input image
		const inputImageMatrix = [
			[WATER,		WATER,		WATER],
			[SAND_C,	SAND_C,		WATER],
			[GRASS_C,	GRASS_C,	SAND_C]
		];
		const inputImageMatrix2 = [
			[WATER,		WATER,		WATER],
			[SAND_C,	SAND_C,		SAND_C],
			[GRASS_C,	GRASS_C,	SAND_C]
		];

		// preview of the input image
		const map = this.make.tilemap({
			data: inputImageMatrix2,
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_WIDTH
		});
		const tileset = map.addTilesetImage("map pack");
		const layer = map.createLayer(0, tileset, 0, 0);

		// preview of the patterns derived from the input image
		let patternMap = null;
		let i = -1;
		this.debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
		this.debugKey.on("down", (key, event) => {

			if (i+1 > WFC.patterns.length-1) {
				console.log("no more patterns to see");
				return;
			}
			i++;

			if (patternMap) {
				patternMap.destroy();
			}

			patternMap = this.make.tilemap({
				data: WFC.patterns[i].tiles,
				tileWidth: TILE_WIDTH,
				tileHeight: TILE_WIDTH
			});
			const patternLayer = patternMap.createLayer(0, tileset, TILE_WIDTH*4, 0);
		});


		// Logic
		this.processInput(inputImageMatrix2, 2);
		console.log(WFC.patterns.length);
	}

	/**
	 * Populates WFC.patterns which is necessary for running the core algorithm.
	 * @param {number[][]} inputImageMatrix the data representation of the input image as a 2D array of tile IDs
	 * @param {number} patternWidth N (as in NxN)
	 */
	processInput(inputImageMatrix, patternWidth)
	{
		ensureValidInput();
		createPatterns();


		/** Ensures that the input to processInput() is valid. */
		function ensureValidInput()
		{
			if (inputImageMatrix.length < 1) {
				throw new Error("Input image height is less than or equal to 0. Can't have an image with no height!");
			}
			if (inputImageMatrix[0].length < 1) {
				throw new Error("Input image width is less than or equal to 0. Can't have an image with no width!");
			}
			if (patternWidth < 1) {
				throw new Error("Pattern width is less than or equal to 0. Can't have a pattern made of 0x0, (-1)x(-1) tiles, etc!");
			}
			if (patternWidth > inputImageMatrix.length) {
				throw new Error("Pattern width is greater than input image width. Can't have a image made of patterns that are larger than it!");
			}
		}

		/**
		 * Iterates over each tile in the input image matrix, making a pattern for each.
		 * @returns {number[][][]} a list of patterns
		 */
		function createPatterns()
		{
			for (let y = 0; y < inputImageMatrix.length; y++) {
				for (let x = 0; x < inputImageMatrix.length; x++) {

					const pattern = createPattern(y, x);
					const index = getPatternIndex(pattern);
					if (index == -1) {
						WFC.patterns.push(createPattern(y, x));
					}
					else {
						WFC.patterns[index].weight++;
					}

				}
			}


			/**
			 * Creates a pattern.
			 * @param {*} y refers to the y position of the top left tile of the pattern in the input image
			 * @param {*} x refers to the x position of the top left tile of the pattern in the input image
			 * @returns {{
			 * 	tiles: [], 
			 * 	adjacencies: [], 
			 * 	weight: number
			 * }} a pattern object
			 */
			function createPattern(y, x)
			{
				return {
					tiles: getTiles(y, x),
					adjacencies: [],
					weight: 1
				};


				/**
				 * Gets the tiles for a pattern.
				 * @param {*} y refers to the y position of the top left tile of the pattern in the input image
				 * @param {*} x refers to the x position of the top left tile of the pattern in the input image
				 * @returns {number[][]} a 2D array of tile IDs
				 */
				function getTiles(y, x)
				{
					const tiles = [];
					for (let ny = 0; ny < patternWidth; ny++) {
					// Ny and Nx refer to the 1st and 2nd N in NxN
						tiles[ny] = [];
						for (let nx = 0; nx < patternWidth; nx++) {
							// iterating over an array without going out of bounds by looping
							// relearned this pattern from https://banjocode.com/post/javascript/iterate-array-with-modulo
							tiles[ny][nx] = inputImageMatrix[(y + ny) % inputImageMatrix.length][(x + nx) % inputImageMatrix.length];
						}
					}
					return tiles;
				}
			}

			function getPatternIndex(pattern)
			{
				// for each pattern already made
				for (let i = 0; i < WFC.patterns.length; i++) {

					let patternsMatch = true;

					// for each tile in the patterns
					for (let y = 0; y < pattern.tiles.length; y++) {
						for (let x = 0; x < pattern.tiles.length; x++) {

							if (pattern.tiles[y][x] != WFC.patterns[i].tiles[y][x]) {
								patternsMatch = false;
								break;
							}

						}
						if (!patternsMatch) {
							break;
						}
					}

					if (patternsMatch) {
						return i;
					}

				}

				return -1;
			}
		}
	}
}