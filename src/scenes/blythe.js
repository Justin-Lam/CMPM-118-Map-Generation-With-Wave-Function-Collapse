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
		// temporary weight array, actual weights will be based on pattern frequency when finding them
		const weights = [
			1, 1, 1,
			1, 1, 1,
			1, 1, 1
		];

		const adjacencies = [
			(0, 1, 0),
		]

		this.failedAttempts = 0;
		this.isSolved = false;

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

	}

	ban()
	{

	}

	observe()
	{

	}

	propagate()
	{

	}
	render()
	{

	}
}