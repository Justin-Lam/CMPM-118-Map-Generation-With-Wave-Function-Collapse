class Blythe extends Phaser.Scene
{
	constructor() {
		super("blytheScene");
	}

	preload()
	{

	}

	create()
	{
		// set up data types

		const adjacencies = [
			// array of Adjacency objects
		];

		this.patternsList = [
			// filled with Pattern objects
		];

		this.waveMatrix = [
			[[], [], []],
		]; // 3D array of bools UPDATE: 2D array of Cell objects

		this.entropyList = [
			[],
		]; // 2D array of ints UPDATE: to be incorporated into each Cell object

		this.failedAttempts = 0;
		this.isSolved = false;

		// find maximum possible entropy of a cell (to use in clear())
		this.maxEntropy = 0;
		for (let x = 0; x < OUTPUT_MAP_WIDTH; x++)
		{
			for (let y = 0; y < OUTPUT_MAP_WIDTH; y++)
			{
				this.maxEntropy += this.patternsList[x][y].weight;
			}
		}

		// set random seed here

		// solve with the constraint solver
		this.constraintSolver();
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
				for (let z = 0; z < this.patternsList.length; z++)
				{
					this.waveMatrix[x][y][z] = true;
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
		this.entropyList[x][y] -= this.patternsList[x][y].weight;
	}

	observe()
	{
		// look for lowest entropy that is not 1
		// if lowest entropy is 0, call clear() and increment failedAttempts
		// MIGHT BE AN EXAMPLE OF WHY WE SHOULD MAKE CELL OBJECTS SINCE THIS NEEDS TO STORE THE CELL THAT HAS THE LEAST ENTROPY

		let minEntropy = 0;

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