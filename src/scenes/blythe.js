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

		this.printPatterns();

		// solve with the constraint solver
		this.constraintSolver();
	}

	getWaveMatrix(patterns)
	{
		let maxEntropy = getMaxEntropy(patterns);
		let waveMatrixTemp = [];
		createEmptyCells(maxEntropy, waveMatrixTemp);
		setAllPatterns(waveMatrixTemp, patterns);

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

		function createEmptyCells(maxEntropy, waveMatrixTemp)
		{
			for (let x = 0; x < OUTPUT_MAP_WIDTH; x++)
			{
				let cells = [];

				for (let y = 0; y < OUTPUT_MAP_WIDTH; y++) 
				{
					cells[y] = {
						possiblePatterns: [],
						entropy: maxEntropy,
						row: x,
						col: y
					};
				}
				waveMatrixTemp[x] = cells;
			}
		}

		function setAllPatterns(waveMatrixTemp, patterns)
		{
			for (let x = 0; x < waveMatrixTemp.length; x++)
			{
				for (let y = 0; y < waveMatrixTemp.length; y++)
				{
					for (let z = 0; z < patterns.length; z++)
					{
						waveMatrixTemp[x][y].possiblePatterns[z] = true;
					}
				}
			}
		}
	}

	constraintSolver()
	{
		let numLoops = 0;
		while (1)
		{
			console.log(numLoops);

			if (this.failedAttempts >= MAX_ATTEMPTS)
			{
				throw new Error("FAILURE: max attempts reached");
			}

			if (this.isSolved() == -1)
			{
				console.log("FAILED ATTEMPT, TRYING AGAIN");
				this.failedAttempts++;
				this.clear();
			}
			else if (this.isSolved() == 1)
			{
				console.log("SOLVED SUCCESSFULLY");
				break;
			}

			this.observe();
			this.propagate();
			numLoops++;
		}

		this.render();
	}

	// -1 = error
	// 0 = not solved yet
	// 1 = solved
	isSolved()
	{
		// loop through every cell, check how many solutions it has
		for (let x = 0; x < this.waveMatrix.length; x++)
		{
			for (let y = 0; y < this.waveMatrix[x].length; y++)
			{
				let numSols = 0;
				let cell = this.waveMatrix[x][y];

				for (let z = 0; z < cell.possiblePatterns.length; z++)
				{
					if (cell.possiblePatterns[z] == true)
					{
						numSols++;
					}

					if (numSols > 1)
					{
						return 0;
					}
				}

				if (numSols < 1)
				{
					return -1;
				}
			}
		}

		return 1;
	}

	clear()
	{
		this.waveMatrix = this.getWaveMatrix(this.patterns);
		console.log(this.waveMatrix);
	}

	printPatterns()
	{
		console.log("PRINTING PATTERNS")
		for (let x = 0; x < this.patterns.length; x++)
		{
			console.log(this.patterns[x]);
		}
		console.log("all patterns printed");
	}

	ban(x, y, z)
	{
		// sets corresponding wave matrix entry to false
		this.waveMatrix[x][y].possiblePatterns[z] = false;

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
				if (this.waveMatrix[x][y].entropy < minEntropy && this.waveMatrix[x][y].entropy > 1)
				{
					minEntropy = this.waveMatrix[x][y].entropy;
					minX = x;
					minY = y;
				}
			}
		}

		// choose random pattern in the cell (probability is affected by the pattern's weight)
		// WEIGHTED RANDOM
		let rand_pattern_num = Math.floor(Math.random() * this.waveMatrix[minX][minY].possiblePatterns.length)
		// let selected_pattern = this.waveMatrix[minX][minY].possiblePatterns[rand_pattern_num];

		// ban() all other patterns in the cell
		console.log("rand num: " + rand_pattern_num);
		for (let z = 0; z < this.waveMatrix[minX][minY].possiblePatterns.length; z++)
		{
			if (z != rand_pattern_num)
			{
				this.ban(minX, minY, z);
			}
		}
		// return selected_pattern;
		this.stack.push(this.waveMatrix[minX][minY]);
	}

	propagate()
	{
		// check adjacent cells' patterns (cells right next to that cell)
		// if they're not in the adjacency list of the pattern(s) of the cell
		// then set the possiblePatterns indexes of cells to false
		// then add the checked cell to the stack

		while (this.stack.length > 0)
		{
			console.log("stack length: " + this.stack.length);
			let cell = this.stack.pop();
			console.log("cell: ");
			console.log(cell);
			console.log("Patterns: " + cell.possiblePatterns);

			// up adjacent cell
			if (cell.row > 0)
			{
				let up = this.waveMatrix[cell.row - 1][cell.col];

				if (up.entropy == 1)
				{
					break;
				}

				console.log("calling propagate for up adjacency");
				this.propagateHelper(cell, up, UP);
				this.stack.push(up);
			}

			// down adjacent cell
			if (cell.row < this.waveMatrix.length - 1)
			{
				let down = this.waveMatrix[cell.row + 1][cell.col];

				if (down.entropy == 1)
				{
					break;
				}

				console.log("calling propagate for down adjacency");
				this.propagateHelper(cell, down, DOWN);
				this.stack.push(down);
			}

			// left adjacent cell
			if (cell.col > 0)
			{
				let left = this.waveMatrix[cell.row][cell.col - 1];

				if (left.entropy == 1)
				{
					break;
				}

				console.log("calling propagate for left adjacency");
				this.propagateHelper(cell, left, LEFT);
				this.stack.push(left);
			}

			// right adjacent cell
			if (cell.col < this.waveMatrix[0].length - 1)
			{
				let right = this.waveMatrix[cell.row][cell.col + 1];

				if (right.entropy == 1)
				{
					break;
				}
				
				console.log("calling propagate for right adjacency");
				this.propagateHelper(cell, right, RIGHT);
				this.stack.push(right);
			}
		}
	}

	propagateHelper(cell, adjCell, direction)
	{
		console.log("adjCell has row = " + adjCell.row + " col = " + adjCell.col);
		console.log("adjCell patterns: " + adjCell.possiblePatterns);
		
		// figure out pattern number(s)
		let patternIndices = [];
		for (let i = 0; i < cell.possiblePatterns.length; i++)
		{
			if (cell.possiblePatterns[i] == true)
			{
				patternIndices[patternIndices.length] = i;
			}
		}

		for (let i = 0; i < adjCell.possiblePatterns.length; i++)
		{
			if (adjCell.possiblePatterns[i] == true)
			{
				let hasPattern = false;
				for (let j = 0; j < this.patterns[i].adjacencies.length; j++) // loop thru adjacencies
				{
					if (patternIndices.includes(this.patterns[i].adjacencies[j].index) && direction == this.patterns[i].adjacencies[j].direction)
					{
						hasPattern = true;
					}
				}

				if (hasPattern == false)
				{
					this.ban(adjCell.row, adjCell.col, i);
				}
			}
		}

		console.log("adjCell NEW patterns: " + adjCell.possiblePatterns);
	}

	render()
	{
		// loop through wave matrix
		// for each cell in the wave matrix, store the id of the valid pattern (should only have one remaining)
		// use the pattern id to get the pattern from the pattern array, this.patterns[id]
		// each pattern object has a list of tile ids
	}

	/*
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
	*/
}