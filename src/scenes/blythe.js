class Blythe extends Phaser.Scene
{
	constructor() {
		super("blytheScene");
	}

	preload()
	{
		this.load.path = './assets/';
		this.load.image("map pack", "mapPack_spritesheet.png");
	}

	create()
	{
		this.mapgen = new MapGen(this);

		// set up map (for testing)
		const inputImageMatrix = [
			[WATER,		WATER,		WATER],
			[SAND_C,	SAND_C,		WATER],
			[GRASS_C,	GRASS_C,	SAND_C]
		];
		const N = 2;

		// set up data types
		const patterns = this.mapgen.getPatterns(inputImageMatrix, N);
		this.waveMatrix = this.getWaveMatrix(patterns);

		console.log(this.waveMatrix);

		this.failedAttempts = 0;
		this.isSolved = false;

		// solve with the constraint solver
		this.constraintSolver();
	}

	getWaveMatrix(patterns)
	{
		let maxEntropy = getMaxEntropy(patterns);
		let boolList = getAllPatterns(patterns);
		let waveMatrixTemp = [];
		createEmptyCells(maxEntropy, boolList, waveMatrixTemp);

		return waveMatrixTemp;

		// find maximum possible entropy of a cell (to use in clear() and wave matrix init)
		function getMaxEntropy(patterns)
		{
			let maxEntropy = 0;

			for (let x = 0; x < patterns.length; x++)
			{
				maxEntropy += patterns[x].weight;
			}

			return maxEntropy;
		}

		function getAllPatterns()
		{
			let boolList = [];

			for (let x = 0; x < patterns.length; x++)
			{
				boolList[x] = true;
			}

			return boolList;
		}

		function createEmptyCells(maxEntropy, boolList, waveMatrixTemp)
		{
			for (let x = 0; x < OUTPUT_MAP_WIDTH; x++)
			{
				let cells = [];

				for (let y = 0; y < OUTPUT_MAP_WIDTH; y++) 
				{
					cells[y] = {
						possiblePatterns: boolList,
						entropy: maxEntropy
					};
				}
				waveMatrixTemp[x] = cells;
			}
		}
	}

	constraintSolver()
	{
		while (!this.isSolved)
		{
			if (this.failedAttempts < MAX_ATTEMPTS)
			{
				throw new Error("FAILURE: max attempts reached");
			}

			this.observe();
			this.propagate();
		}
	}

	clear()
	{
		// sets all wave matrix values to true
		for (let x = 0; x < OUTPUT_MAP_WIDTH; x++)
		{
			for (let y = 0; y < OUTPUT_MAP_WIDTH; y++)
			{
				for (let z = 0; z < this.patterns.length; z++)
				{
					this.waveMatrix[x][y][z] = true;
					// change to this.waveMatrix[x][y].possiblePatterns[z]
				}
			}
		}

		// sets all entropy values to the max
		for (let x = 0; x < OUTPUT_MAP_WIDTH; x++)
		{
			for (let y = 0; y < OUTPUT_MAP_WIDTH; y++)
			{
				this.entropyList[x][y] = this.maxEntropy;
			}
		}
	}

	ban(x, y, z)
	{
		// sets corresponding wave matrix entry to false
		this.waveMatrix[x][y][z] = false;

		// decrements entropy value of the cell
		this.entropyList[x][y] -= this.patterns[x][y].weight;
	}

	randomNum()
	{
        return Math.floor(Math.random() * this.patterns.length)
    }

	observe()
	{
		// look for lowest entropy that is not 1
		// if lowest entropy is 0, call clear() and increment failedAttempts
		// MIGHT BE AN EXAMPLE OF WHY WE SHOULD MAKE CELL OBJECTS SINCE THIS NEEDS TO STORE THE CELL THAT HAS THE LEAST ENTROPY

		let minEntropy = maxEntropy;
		let lowestEntropyCells = [];
		for (let x = 0; x < OUTPUT_MAP_WIDTH; x++)
		{
			for (let y = 0; y < OUTPUT_MAP_WIDTH; y++)
			{
				if (this.waveMatrix[x][y][entropy] < minEntropy)
				{
					minEntropy = this.waveMatrix[x][y][entropy];
				}
			}
		}

		// choose random pattern in the cell (probability is affected by the pattern's weight)
		

		// ban() all other patterns in the cell
	}

	propagate()
	{

	}

	render()
	{

	}
}