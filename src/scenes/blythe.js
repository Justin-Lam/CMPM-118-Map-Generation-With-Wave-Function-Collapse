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
		this.waveMatrix = []; // wave matrix will be a 2d array of cell types
		this.patterns = this.mapgen.getPatterns(inputImageMatrix, N);
		this.clear(this.patterns);

		this.failedAttempts = 0;

		// create a stack for use in propagate()
		this.stack = [];

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
						entropy: maxEntropy,
						row: x,
						col: y
					};
				}
				waveMatrixTemp[x] = cells;
			}
		}
	}

	constraintSolver()
	{
		while (!this.isSolved())
		{
			if (this.failedAttempts >= MAX_ATTEMPTS)
			{
				throw new Error("FAILURE: max attempts reached");
			}

			this.observe();
			this.propagate();
		}

		this.render();
	}

	isSolved()
	{
		return false;
	}

	clear()
	{
		this.waveMatrix = this.getWaveMatrix(this.patterns);
		console.log(this.waveMatrix);
	}

	ban(x, y, z)
	{
		// sets corresponding wave matrix entry to false
		this.waveMatrix[x][y].possiblePatterns[z] = false;
		
		// adds the cell to the stack for propagation
		this.stack[this.stack.length] = this.waveMatrix[x][y];

		// decrements entropy value of the cell
		this.waveMatrix[x][y].entropy -= this.patterns[x].weight;
	}

	observe()
	{
		// look for lowest entropy that is not 1
		// if lowest entropy is 0, call clear() and increment failedAttempts

		let minEntropy = this.waveMatrix[0][0].entropy;
		let minX = 0;
		let minY = 0;
		for (let x = 0; x < this.waveMatrix.length; x++)
		{
			for (let y = 0; y < this.waveMatrix[x].length; y++)
			{
				if (this.waveMatrix[x][y].entropy < minEntropy)
				{
					minEntropy = this.waveMatrix[x][y].entropy;
					minX = x;
					minY = y;
				}
			}
		}

		// choose random pattern in the cell (probability is affected by the pattern's weight)
		let rand_pattern_num = Math.floor(Math.random() * this.waveMatrix[minX][minY].possiblePatterns.length)
		let selected_pattern = this.waveMatrix[minX][minY].possiblePatterns[rand_pattern_num];

		// ban() all other patterns in the cell
		for (let z = 0; z < this.waveMatrix[minX][minY].possiblePatterns.length; z++)
		{
			if (z != rand_pattern_num)
			{
				this.ban(minX, minY, z);
			}
		}
		return selected_pattern;
	}

	propagate()
	{
		// check adjacent cells' patterns (cells right next to that cell)
		// if they're not in the adjacency list of the pattern(s) of the cell
		// then set the possiblePatterns indexes of cells to false
		// then add the checked cell to the stack

		while (this.stack.length > 0)
		{
			let cell = this.stack.pop();

			// up adjacent cell
			if (cell.row > 0)
			{
				let up = this.waveMatrix[row - 1][col];
				this.propagateHelper(cell, up);
				this.stack.push(up);
			}

			// down adjacent cell
			if (cell.row < this.waveMatrix.length - 1)
			{
				let down = this.waveMatrix[row + 1][col];
				this.propagateHelper(cell, down);
				this.stack.push(down);
			}

			// left adjacent cell
			if (cell.col > 0)
			{
				let left = this.waveMatrix[row][col - 1];
				this.propagateHelper(cell, left);
				this.stack.push(left);
			}

			// right adjacent cell
			if (cell.col < this.waveMatrix[0].length)
			{
				let right = this.waveMatrix[row][col + 1];
				this.propagateHelper(cell, right);
				this.stack.push(right);
			}
		}
	}

	propagateHelper(cell, adjCell)
	{
		let pattern = cell.possiblePatterns[0];

		for (let i = 0; i < adjCell.possiblePatterns.length; i++)
		{
			if (adjCell.possiblePatterns[i] == true)
			{
				if (!this.patterns[i].adjacencies.includes(pattern, 0))
				{
					adjCell.possiblePatterns[i] = false;
				}
			}
		}
	}

	render()
	{

	}

	addDecor(){
        let decorArray = Array.from({ length: TILEWIDTH }, () => Array(TILEWIDTH).fill(0));
        for (var x = 0; x < this.TILEHEIGHT; x++) {
            for (var y = 0; y < this.TILEWIDTH; y++) {
                if (this.waveMatrix[x][y]. != WATER && Phaser.Math.FloatBetween(0, 100) < 20){
                    decorArray[x][y] = 62; //tiny grass
                }
                else{
                    decorArray[x][y] = 195; //transparent
                }
            }
        }
        const decor = this.make.tilemap({
            data: decorArray,
            tileWidth: TILEWIDTH,
            tileHeight: TILEWIDTH
        })
        const decor_tilesheet = decor.addTilesetImage("map pack")
        const decor_layer = decor.createLayer(0, decor_tilesheet, 0, 0);
    }
}