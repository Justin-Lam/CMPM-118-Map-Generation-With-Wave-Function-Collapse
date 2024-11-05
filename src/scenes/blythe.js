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

		this.patterns = this.mapgen.getPatterns(inputImageMatrix, N);

		// set up for entropy calculation, taken from kchapelier's WFC implementation
		this.startingEntropy = 0;
		this.weightLogWeights = [];
		this.sumOfWeights = 0;
		this.sumOfWeightLogWeights = 0;

		this.getStartingEntropy();
		this.sumsOfWeights = [];
		this.sumsOfWeightLogWeights = [];

		// set up wave matrix
		this.waveMatrix = []; // wave matrix will be a 2d array of cell types
		this.waveMatrix = this.getWaveMatrix(this.patterns, this.startingEntropy);
		//this.clear(this.patterns);

		this.failedAttempts = 0;

		// create a stack for use in propagate()
		this.stack = [];

		this.printPatterns();

		// solve with the constraint solver
		this.constraintSolver();
	}

	getStartingEntropy()
	{
		for (let t = 0; t < this.patterns.length; t++) 
		{
			this.weightLogWeights[t] = this.patterns[t].weight * Math.log(this.patterns[t].weight);
			this.sumOfWeights += this.patterns[t].weight;
			this.sumOfWeightLogWeights += this.weightLogWeights[t];
		}

		this.startingEntropy = Math.log(this.sumOfWeights) - this.sumOfWeightLogWeights / this.sumOfWeights;
		console.log("starting entropy: " + this.startingEntropy);
	}

	getWaveMatrix(patterns, startingEntropy)
	{
		let waveMatrixTemp = [];
		createEmptyCells(startingEntropy, waveMatrixTemp, patterns);
		setAllPatterns(waveMatrixTemp, patterns);

		return waveMatrixTemp;

		function createEmptyCells(startingEntropy, waveMatrixTemp, patterns)
		{
			for (let x = 0; x < OUTPUT_MAP_WIDTH; x++)
			{
				let cells = [];

				for (let y = 0; y < OUTPUT_MAP_WIDTH; y++) 
				{
					cells[y] = {
						possiblePatterns: [],
						entropy: startingEntropy,
						row: x,
						col: y,
						id: 0,
						tileEnablerCounts: [patterns.length, patterns.length, patterns.length, patterns.length]
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
		while (numLoops < 1)
		//while(1)
		{
			console.log("numLoops: " + numLoops);
			console.log("failed attempts: " + this.failedAttempts);

			let isSolved = this.isSolved();

			if (this.failedAttempts >= MAX_ATTEMPTS)
			{
				throw new Error("FAILURE: max attempts reached");
			}

			if (isSolved == -1)
			{
				console.log("FAILED ATTEMPT, TRYING AGAIN");
				this.failedAttempts++;
				this.clear();
			}
			else if (isSolved == 1)
			{
				console.log("SOLVED SUCCESSFULLY");
				break;
			}

			if (this.observe() == 0)
			{
				console.log("FAILED ATTEMPT, TRYING AGAIN");
				this.failedAttempts++;
				this.clear();
				continue;
			}

			if (this.propagate() == 0)
			{
				console.log("FAILED ATTEMPT, TRYING AGAIN");
				this.failedAttempts++;
				this.clear();
				continue;
			}
			numLoops++;
		}

		this.render();
	}

	// -1 = error
	// 0 = not solved yet
	// 1 = solved
	isSolved()
	{
		console.log("printing current full list of pattern possibilities in wave matrix");
		this.printPossibilities();
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
		this.waveMatrix = this.getWaveMatrix(this.patterns, this.startingEntropy);
		this.stack = [];
		for (let i = 0; i < this.patterns.length; i++)
		{
			this.sumsOfOnes[i] = this.weights.length;
    		this.sumsOfWeights[i] = this.sumOfWeights;
    		this.sumsOfWeightLogWeights[i] = this.sumOfWeightLogWeights;
		}
	}

	printPatterns()
	{
		console.log("PRINTING PATTERN INFO")
		for (let x = 0; x < this.patterns.length; x++)
		{
			console.log(this.patterns[x]);
		}
		console.log("all patterns printed");
	}

	printPossibilities()
	{
		for (let x = 0; x < this.patterns.length; x++)
		{
			for (let y = 0; y < this.patterns.length; y++)
			{
				console.log("row " + x + " col " + y + " possible patterns: " + this.waveMatrix[x][y].possiblePatterns);
			}	
		}
	}

	getOpposite(dir)
	{
		if (dir == UP)
		{
			return DOWNREP;
		}
		else if (dir == DOWN)
		{
			return UPREP;
		}
		else if (dir == LEFT)
		{
			return LEFTREP;
		}
		else
		{
			return RIGHTREP;
		}
	}

	ban(x, y, i)
	{
		const comp = waveMatrix[x][y].tileEnablerCounts;

		for (let d = 0; d < 4; d++)
		{
			comp[d] = 0;
		}

		// sets corresponding wave matrix entry to false
		this.waveMatrix[x][y].possiblePatterns[i] = false;

		// push onto stack for propagation
		this.stack.push(this.waveMatrix[x][y]);

		// update entropy
		this.sumsOfWeights[i] -= this.patterns[i].weight;
  		this.sumsOfWeightLogWeights[i] -= this.weightLogWeights[i];

		const sum = this.sumsOfWeights[i];
		this.waveMatrix[x][y].entropy = Math.log(sum) - this.sumsOfWeightLogWeights[i] / sum;
	}

	observe()
	{
		console.log("OBSERVING");
		// look for lowest entropy that is not 1
		// if lowest entropy is 0, call clear() and increment failedAttempts

		let minEntropy = this.maxEntropy;
		let minX = 0;
		let minY = 0;
		for (let x = 0; x < this.waveMatrix.length; x++)
		{
			for (let y = 0; y < this.waveMatrix[x].length; y++)
			{
				if (this.waveMatrix[x][y].entropy < minEntropy && this.waveMatrix[x][y].entropy != 1)
				{
					if (this.waveMatrix[x][y].entropy <= 0)
					{
						console.log("error found when observing, returning");
						return 0;
					}
					minEntropy = this.waveMatrix[x][y].entropy;
					minX = x;
					minY = y;
				}
			}
		}

		console.log("cell with least entropy: row " + minX + " col " + minY + " with entropy " + minEntropy);
		console.log("pattern possibilities in cell with least entropy: " + this.waveMatrix[minX][minY].possiblePatterns);

		// choose random pattern in the cell (probability is affected by the pattern's weight)
		// WEIGHTED RANDOM
		// WEIGHTED RANDOM ALGORITHM (credits: https://dev.to/jacktt/understanding-the-weighted-random-algorithm-581p)
		let total = 0;
		for (let i = 0; i < this.patterns.length; i++) {
			total += this.patterns[i].weight;
		}
		const rand_weight = Math.ceil(Math.random() * total);
		let selected_pattern;
		let pattern_index;
		let cursor = 0;
		for (let i = 0; i < this.patterns.length; i++)
		{
			cursor += this.patterns[i].weight;
			if (cursor >= rand_weight && this.waveMatrix[minX][minY].possiblePatterns[i] == true)
			{
				selected_pattern = this.patterns[i];
				pattern_index = i;
				break;
			}
		}

		console.log("index of rand pattern chosen: " + pattern_index);

		// ban() all other patterns in the cell
		//console.log("rand num: " + rand_pattern_num);
		for (let z = 0; z < this.waveMatrix[minX][minY].possiblePatterns.length; z++)
		{
			if (z != pattern_index)
			{
				this.ban(minX, minY, z);
			}
		}
		// return selected_pattern;
		//this.stack.push(this.waveMatrix[minX][minY]);
	}

	propagate()
	{
		// check adjacent cells' patterns (cells right next to that cell)
		// if they're not in the adjacency list of the pattern(s) of the cell
		// then set the possiblePatterns indexes of cells to false
		// then add the checked cell to the stack
		console.log("PROPAGATING");

		while (this.stack.length > 0)
		{
			console.log("stack length: " + this.stack.length);
			let cell = this.stack.pop();

			if (cell.entropy == 0)
			{
				return 0;
			}

			console.log("cell being propagated: " + "row " + cell.row + " col " + cell.col);
			console.log(cell);
			console.log("patterns in cell : " + cell.possiblePatterns);

			// up adjacent cell
			if (cell.row > 0)
			{
				let up = this.waveMatrix[cell.row - 1][cell.col];

				if (up.entropy == 1)
				{
					break;
				}
				else if (up.entropy == 0)
				{
					return 0;
				}

				console.log("calling propagate for up adjacency");
				this.propagateHelper(cell, up, DOWN);
				//this.stack.push(up);
			}

			// down adjacent cell
			if (cell.row < this.waveMatrix.length - 1)
			{
				let down = this.waveMatrix[cell.row + 1][cell.col];

				if (down.entropy == 1)
				{
					break;
				}
				else if (down.entropy == 0)
				{
					return 0;
				}

				console.log("calling propagate for down adjacency");
				this.propagateHelper(cell, down, UP);
				//this.stack.push(down);
			}

			// left adjacent cell
			if (cell.col > 0)
			{
				let left = this.waveMatrix[cell.row][cell.col - 1];

				if (left.entropy == 1)
				{
					break;
				}
				else if (left.entropy == 0)
				{
					return 0;
				}

				console.log("calling propagate for left adjacency");
				this.propagateHelper(cell, left, RIGHT);
				//this.stack.push(left);
			}

			// right adjacent cell
			if (cell.col < this.waveMatrix[0].length - 1)
			{
				let right = this.waveMatrix[cell.row][cell.col + 1];

				if (right.entropy == 1)
				{
					break;
				}
				else if (right.entropy == 0)
				{
					return 0;
				}
				
				console.log("calling propagate for right adjacency");
				this.propagateHelper(cell, right, LEFT);
				//this.stack.push(right);
			}
		}

		return 1;
	}

	propagateHelper(cell, adjCell, direction)
	{
		console.log("adjCell has row = " + adjCell.row + " col = " + adjCell.col);
		console.log("adjCell patterns: " + adjCell.possiblePatterns);

		// figure out pattern number(s)
		let possiblePatternIndices = [];
		for (let i = 0; i < cell.possiblePatterns.length; i++)
		{
			if (cell.possiblePatterns[i] == true)
			{
				possiblePatternIndices[possiblePatternIndices.length] = i;
			}
		}

		let patternAdjacencyIndices = []; // aka compatible tiles
		possiblePatternIndices.forEach(patternIndex => {
			this.patterns[patternIndex].adjacencies.forEach(adjacency => {
				if (adjacency.direction == direction) {
					patternAdjacencyIndices.push(adjacency.index);
				}
			})
		})

		console.log("adjacent patterns in cell direction: " + patternAdjacencyIndices);

		for (let i = 0; i < adjCell.possiblePatterns.length; i++)
		{
			if (adjCell.possiblePatterns[i] == true && !patternAdjacencyIndices.includes(i))
			{
				this.ban(adjCell.row, adjCell.col, i);
			}
		}
		
		/*
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
		*/

		console.log("adjCell NEW patterns: " + adjCell.possiblePatterns);
	}

	render()
	{
		// loop through wave matrix
		// for each cell in the wave matrix, store the id of the valid pattern (should only have one remaining)
		// use the pattern id to get the pattern from the pattern array, this.patterns[id]
		// each pattern object has a list of tile ids
		for (let x = 0; x < this.waveMatrix.length; x++)
		{
			for (let y = 0; y < this.waveMatrix[x].length; x++)
			{
				for(let i = 0; i < this.waveMatrix[x][y].possiblePatterns.length; i++)
				{
					if (this.waveMatrix[x][y].possiblePatterns[i] == true)
					{
						pattern_index = i;
					}
				}
				let tile_id = this.patterns[pattern_index].tiles[0];
				this.waveMatrix[x][y].id = tile_id;
			}
		}
		let renderArray = Array.from({ length: TILEWIDTH }, () => Array(TILEWIDTH).fill(0));
		for (let x = 0; x < this.waveMatrix.length; x++)
		{
			for (let y = 0; y < this.waveMatrix[x].length; x++)
			{
				renderArray[x][y] = this.waveMatrix[x][y].id;
			}
		}
		const render = this.make.tilemap({
            data: renderArray,
            tileWidth: TILEWIDTH,
            tileHeight: TILEWIDTH
        })
        const render_tilesheet = render.addTilesetImage("map pack");
        const render_layer = render.createLayer(0, render_tilesheet, 0, 0);
	}

	
	addDecor(){
        let decorArray = Array.from({ length: TILEWIDTH }, () => Array(TILEWIDTH).fill(0));
        for (var x = 0; x < this.TILEHEIGHT; x++) {
            for (var y = 0; y < this.TILEWIDTH; y++) {
                if (this.getTileID(x, y) != WATER && Phaser.Math.FloatBetween(0, 100) < 20){
                    decorArray[x][y] = 62; //mushrooms
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
	
	getTileID(x, y)
	{
		let pattern_index;
		for(let i = 0; i < this.waveMatrix[x][y].possiblePatterns.length; i++)
		{
			if (this.waveMatrix[x][y].possiblePatterns[i] == true)
			{
				pattern_index = i;
			}
		}
		let tile_id = this.patterns[pattern_index].tiles[0];
		return tile_id;
	}
}