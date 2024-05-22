import ColorInterface from "../interfaces/colorInterface";
import RuneInterface from "../interfaces/runeInterface";

class Socket extends Phaser.GameObjects.Image {
  private id: number;
  private shape: Phaser.Geom.Circle;
  private isTaken: boolean;
  private degrees: number;
  private _rune?: RuneInterface;
  private _color?: ColorInterface;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: number,
    degrees: number
  ) {
    super(scene, x, y, "socket");

    this.id = id;
    this.shape = new Phaser.Geom.Circle(x, y, 64);
    this.isTaken = false;
    this.degrees = degrees * 30;

    scene.add.existing(this);
  }

  public get getId(): number {
    return this.id;
  }

  public get getDegrees(): number {
    return this.degrees;
  }

  public get getShape(): Phaser.Geom.Circle {
    return this.shape;
  }

  public get getIsTaken(): boolean {
    return this.isTaken;
  }

  public get rune(): RuneInterface | undefined {
    return this._rune;
  }

  public get color(): ColorInterface | undefined {
    return this._color;
  }

  public set rune(rune: RuneInterface) {
    this._rune = rune;
  }

  public set color(color: ColorInterface) {
    this._color = color;
  }

  public resetRuneAndColor(): void {
    this._rune = undefined;
    this._color = undefined;
  }

  public updateIsTaken(isTaken: boolean): void {
    this.isTaken = isTaken;
  }
}

export default Socket;
