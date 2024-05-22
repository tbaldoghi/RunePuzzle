import runePositions from "../constants/runePositions";
import Colors from "../enums/colors";
import Events from "../enums/events";
import Runes from "../enums/runes";
import ColorInterface from "../interfaces/colorInterface";
import RuneInterface from "../interfaces/runeInterface";
import eventHandler from "./eventHandler";

interface SocketData {
  x?: number;
  y?: number;
  id?: number;
}

class Rune extends Phaser.GameObjects.Container {
  private stone: Phaser.GameObjects.Sprite;
  private runeLeftImage: Phaser.GameObjects.Image;
  private runeRightImage: Phaser.GameObjects.Image;
  private shape: Phaser.Geom.Circle;
  private isInSocket: boolean;
  private _isOnBoard: boolean;
  private _id: number;
  private _boardPosition: number;
  private socketData: SocketData = {};
  private _rune: RuneInterface = { left: "", right: "" };
  private _color: ColorInterface = { left: "", right: "" };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: number,
    boardPosition: number
  ) {
    super(scene, x, y);

    this.isInSocket = false;
    this._isOnBoard = false;
    this._id = id;
    this._boardPosition = boardPosition;
    this.shape = new Phaser.Geom.Circle(x, y, 60);
    this.stone = scene.add.sprite(0, 0, "stone");
    this.runeLeftImage = scene.add.image(0, 0, this.generateRuneName("left"));
    this.runeRightImage = scene.add.image(0, 0, this.generateRuneName("right"));
    this.setSize(128, 128);
    this.stone.setPosition(x, y);
    this.add([this.runeLeftImage, this.runeRightImage]);
    this.enable();
    scene.add.existing(this);
  }

  public enable(): void {
    this.setInteractive({ draggable: true });
    this.handleDrag();
  }

  public disable(): void {
    this.disableInteractive();
  }

  public get getShape(): Phaser.Geom.Circle {
    return this.shape;
  }

  public get rune(): RuneInterface {
    return this._rune;
  }

  public get color(): ColorInterface {
    return this._color;
  }

  public get id(): number {
    return this._id;
  }

  public get getIsInSocket(): boolean {
    return this.isInSocket;
  }

  public set isOnBoard(isOnBoard: boolean) {
    this._isOnBoard = isOnBoard;
  }

  public get isOnBoard(): boolean {
    return this._isOnBoard;
  }

  public get boardPosition(): number {
    return this._boardPosition;
  }

  public get getStone(): Phaser.GameObjects.Sprite {
    return this.stone;
  }

  public updateIsInSocket(isInSocket: boolean): void {
    this.isInSocket = isInSocket;
  }

  public updateAngle(degrees: number): void {
    this.setAngle(degrees);
    this.stone.setFrame(degrees / 30);
  }

  public updateSocketData(x: number, y: number, id: number): void {
    this.isInSocket = true;
    this.socketData.x = x;
    this.socketData.y = y;
    this.socketData.id = id;
  }

  public resetSocketData(): void {
    this.isInSocket = false;
    this.socketData = {};
  }

  private handleDrag(): void {
    this.on("drag", (_pointer: any, x: number, y: number) => {
      this.updatePosition(x, y);
    });

    this.on("dragstart", () => {
      eventHandler.emit(Events.currentRune, this.id);

      if (this.isInSocket) {
        eventHandler.emit(Events.outSocket, this.socketData.id, this.id);
      }
    });

    this.on("dragend", () => {
      if (this.isInSocket) {
        this.updatePosition(this.socketData.x, this.socketData.y);

        eventHandler.emit(Events.inSocket, this.socketData.id, this.id);
      } else {
        this.updatePosition(
          runePositions.nextRune.x,
          runePositions.nextRune.y * this._boardPosition +
            (runePositions.nextRune.offset || 0)
        );
        this.updateAngle(0);
      }
    });
  }

  private generateRuneName(side: string): string {
    if (side === "left") {
      this._color.left = Object.values(Colors)[this.randomValue(Colors.length)];
      this._rune.left = Object.values(Runes)[this.randomValue(Runes.length)];
      return `rune_${this._rune.left}_${this._color.left}_${side}`;
    }

    this._color.right = Object.values(Colors)[this.randomValue(Colors.length)];
    this._rune.right = Object.values(Runes)[this.randomValue(Runes.length)];
    return `rune_${this._rune.right}_${this._color.right}_${side}`;
  }

  private updatePosition(x?: number, y?: number): void {
    this.setPosition(x, y);
    this.shape.setPosition(x, y);
    this.stone.setPosition(x, y);
  }

  private randomValue(max: number): number {
    return Math.floor(Math.random() * max);
  }
}

export default Rune;
