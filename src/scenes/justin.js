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

	debug()
	{
		
	}

	create()
	{
		// test input images
		const inputImageMatrix1 = [
			[WATER,		WATER,		WATER],
			[SAND_C,	SAND_C,		WATER],
			[GRASS_C,	GRASS_C,	SAND_C]
		];
		const inputImageMatrix2 = [
			[WATER,		WATER,		WATER],
			[SAND_C,	SAND_C,		SAND_C],
			[GRASS_C,	GRASS_C,	SAND_C]
		];
		const inputImageMatrix3 = [
			[WATER,		WATER,		WATER],
			[SAND_C,	SAND_C,		SAND_C],
			[GRASS_C,	GRASS_C,	GRASS_C]
		];
		const inputImageMatrix4 = [
			[WATER,	WATER,	WATER],
			[WATER,	WATER,	WATER],
			[WATER,	WATER,	WATER]
		];
		const inputImageMatrix = inputImageMatrix1;

		// preview of the input image
		const map = this.make.tilemap({
			data: inputImageMatrix,
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
		this.processInput(inputImageMatrix, 2);
		console.log(WFC.patterns.length + " unique patterns");
	}

	/**
	 * Processes the input to get necessary pattern data for running the constraint solver. Records this data in the global WFC object.
	 * @param {number[][]} inputImageMatrix the data representation of the input image as a 2D array of tile IDs
	 * @param {number} patternWidth N (as in NxN)
	 */
	processInput(inputImageMatrix, patternWidth)
	{
		ensureValidInput();
		WFC.patterns = createPatterns();


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
		 * @returns {{}[]} an array of unqiue pattern objects
		 */
		function createPatterns()
		{
			const patterns = [];
			for (let y = 0; y < inputImageMatrix.length; y++) {
				for (let x = 0; x < inputImageMatrix[0].length; x++) {
					const pattern = createPattern(y, x);
					const index = getPatternIndex(pattern, patterns);
					if (index == -1) {
						patterns.push(pattern);
					}
					else {
						patterns[index].weight++;
					}
				}
			}
			return patterns;


			/**
			 * Creates a pattern.
			 * @param {number} y the y position of the top left tile of the pattern in the input image
			 * @param {number} x the x position of the top left tile of the pattern in the input image
			 * @returns {{}} a pattern object
			 */
			function createPattern(y, x)
			{
				return {
					tiles: getTiles(y, x),
					adjacencies: [],
					weight: 1
				};

				
				/**
				 * Returns the tiles of a pattern.
				 * @param {number} y the y position of the top left tile of the pattern in the input image
				 * @param {number} x the x position of the top left tile of the pattern in the input image
				 * @returns {number[][]} a 2D array of tile IDs
				 */
				function getTiles(y, x)
				{
					const tiles = [];
					for (let ny = 0; ny < patternWidth; ny++) {
					// Ny and Nx refer to the 1st and 2nd N in NxN
						tiles[ny] = [];
						for (let nx = 0; nx < patternWidth; nx++) {
							// using modulo to loop around an array in order to avoid going out of bounds
							// relearned this pattern from https://banjocode.com/post/javascript/iterate-array-with-modulo
							tiles[ny][nx] = inputImageMatrix[(y + ny) % inputImageMatrix.length][(x + nx) % inputImageMatrix.length];
						}
					}
					return tiles;
				}
			}

			/**
			 * Finds the index of a pattern in an array of patterns by comparing tiles.
			 * @param {{}} pattern the pattern to check
			 * @param {{}[]} patterns an array of patterns
			 * @returns {number} the index at which pattern is in patterns if true, or -1 if false
			 */
			function getPatternIndex(pattern, patterns)
			{
				// learned about findIndex() and every() from ChatGPT when asking it to refactor my old code for this function
				// find the index at which the input pattern matches with an element in patterns; determine a match by comparing tiles
				return patterns.findIndex(patternElem => pattern.tiles.every((row, y) => row.every((tile, x) => tile == patternElem.tiles[y][x])));
			}
		}
	}
}