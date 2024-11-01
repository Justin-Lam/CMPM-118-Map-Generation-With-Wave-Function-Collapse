class MapGen extends Phaser.Scene
{

    // final wfc implementation goes here


	constructor() {
		super("mapGenScene");
	}

	preload()
	{
		this.load.path = './assets/';
		this.load.image("map pack", "mapPack_spritesheet.png");
	}

	create()
	{

	}
}