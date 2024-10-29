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
		const inputImage = [
			[WATER,		WATER,		WATER],
			[SAND_C,	SAND_C,		WATER],
			[GRASS_C,	GRASS_C,	SAND_C]
		];

		const grassTest = [
			[GRASS_TL,	GRASS_TM,	GRASS_TR],
			[GRASS_LM,	GRASS_C,	GRASS_RM],
			[GRASS_BL,	GRASS_BM,	GRASS_BR]
		];

		const sandTest = [
			[SAND_TL,	SAND_TM,	SAND_TR],
			[SAND_LM,	SAND_C,		SAND_RM],
			[SAND_BL,	SAND_BM,	SAND_BR]
		];

		const map = this.make.tilemap({
			data: inputImage,
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_WIDTH
		});
		const tileset = map.addTilesetImage("map pack");
		const layer = map.createLayer(0, tileset, 0, 0);
	}
}