import { Scene } from "phaser";
import Runes from "../enums/runes";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, "background");

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("assets");
    this.load.image("logo", "logo.png");
    this.load.spritesheet("stone", `stone.png`, {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.image("socket", "socket.png");

    const colors = ["blue", "green", "purple", "red", "yellow"];
    const runes = ["one", "two", "three", "four", "five"];
    const sides = ["left", "right"];

    for (let i = 0; i < runes.length; i++) {
      for (let j = 0; j < colors.length; j++) {
        for (let k = 0; k < sides.length; k++) {
          const name = `rune_${runes[i]}_${colors[j]}_${sides[k]}`;

          this.load.image(name, `${name}.png`);
        }
      }
    }

    this.load.image("background", "background_rune_puzzle.png");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }
}
