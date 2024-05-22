import { Scene } from "phaser";
import Rune from "../game/rune";
import Socket from "../game/socket";
import eventHandler from "../game/eventHandler";
import Events from "../enums/events";
import runePositions from "../constants/runePositions";
import ColorInterface from "../interfaces/colorInterface";
import RuneInterface from "../interfaces/runeInterface";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  emitter: Phaser.Events.EventEmitter;
  currentRuneId: number;
  runes: Rune[] = [];
  outerSockets: Socket[] = [];
  innerSockets: Socket[] = [];

  constructor() {
    super("Game");

    this.emitter = new Phaser.Events.EventEmitter();
  }

  create() {
    eventHandler.on(
      Events.inSocket,
      (socketId: number, runeId: number): void => {
        const socket = [...this.outerSockets, ...this.innerSockets].find(
          (socket: Socket) => socket.getId === socketId
        );
        const currentRune = this.runes.find((rune: Rune) => rune.id === runeId);

        if (socket && currentRune) {
          if (!currentRune.isOnBoard) {
            const boardPosition = currentRune.boardPosition;
            const newRune = new Rune(
              this,
              runePositions.nextRune.x,
              runePositions.nextRune.y * boardPosition +
                (runePositions.nextRune.offset || 0),
              Math.max(...this.runes.map((rune: Rune): number => rune.id)) + 1,
              boardPosition
            );

            currentRune.isOnBoard = true;
            this.runes.splice(newRune.boardPosition, 0, newRune);
          }

          socket.updateIsTaken(true);
          socket.rune = currentRune.rune;
          socket.color = currentRune.color;
        }
      },
      this
    );

    eventHandler.on(
      Events.outSocket,
      (socketId: number, runeId: number): void => {
        console.log("Lefut");
        const socket = [...this.outerSockets, ...this.innerSockets].find(
          (socket: Socket) => socket.getId === socketId
        );
        const rune = this.runes.find((rune: Rune) => rune.id === runeId);
        console.log("Lefut");
        if (socket && rune) {
          console.log("Lefut");
          socket.updateIsTaken(false);
          socket.resetRuneAndColor();
          rune.updateIsInSocket(false);
        }
      }
    );

    eventHandler.on(Events.currentRune, (runeId: number): void => {
      this.currentRuneId = runeId;

      const rune = this.runes.find((rune: Rune) => rune.id === runeId);

      if (rune) {
        this.children.bringToTop(rune.getStone);
        this.children.bringToTop(rune);
      }
    });

    this.background = this.add.image(960, 540, "background");

    const pointsText = this.add
      .text(100, 975, "Points:\n0 ", {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#d2c9a5",
        stroke: "#4b3d44",
        strokeThickness: 8,
        align: "left",
      })
      .setOrigin(0.5);

    for (let i = 0; i < 12; i++) {
      const x = 800 + Math.sin((i * 30 * Math.PI) / 180) * 325;
      const y = 425 - Math.cos((i * 30 * Math.PI) / 180) * 325;

      this.outerSockets.push(new Socket(this, x, y, i, i));
    }

    for (let i = 0; i < 4; i++) {
      const x = 800 + Math.sin((i * 90 * Math.PI) / 180) * 125;
      const y = 425 - Math.cos((i * 90 * Math.PI) / 180) * 125;

      this.innerSockets.push(new Socket(this, x, y, i + 12, i * 3));
    }

    for (let i = 0; i <= 2; i++) {
      this.runes.push(
        new Rune(
          this,
          runePositions.nextRune.x,
          runePositions.nextRune.y * i + (runePositions.nextRune.offset || 0),
          i + 1,
          i
        )
      );
    }
  }

  update(): void {
    const rune = this.runes.find(
      (rune: Rune): boolean => rune.id === this.currentRuneId
    );

    const takenSockets: boolean[] = [];

    [...this.outerSockets, ...this.innerSockets].forEach(
      (socket: Socket): void => {
        if (rune) {
          if (
            Phaser.Geom.Intersects.CircleToCircle(
              rune.getShape,
              socket.getShape
            ) &&
            !socket.getIsTaken
          ) {
            rune.updateAngle(socket.getDegrees);

            if (
              this.checkNeighbourSockets(rune.rune, rune.color, socket.getId)
            ) {
              takenSockets.push(true);
            } else {
              takenSockets.push(false);
            }
          } else {
            takenSockets.push(false);
          }
        }
      }
    );

    const socketIndex = takenSockets.findIndex(
      (takenSocket: boolean): boolean => takenSocket
    );

    if (rune && socketIndex !== -1) {
      const socket = [...this.outerSockets, ...this.innerSockets][socketIndex];

      rune.updateSocketData(socket.x, socket.y, socket.getId);
    } else {
      rune?.resetSocketData();
    }
  }

  private checkNeighbourSockets(
    rune: RuneInterface,
    color: ColorInterface,
    currentSocketId: number
  ): boolean {
    const sockets = [...this.outerSockets, ...this.innerSockets];
    const index = sockets.findIndex(
      (socket: Socket) => currentSocketId === socket.getId
    );

    let previousIndex: number = index - 1;
    let nextIndex: number = index + 1;

    if (previousIndex === this.outerSockets.length - 1) {
      previousIndex = sockets.length - 1;
    }

    if (previousIndex === -1) {
      previousIndex = this.outerSockets.length - 1;
    }

    if (nextIndex === this.outerSockets.length) {
      nextIndex = 0;
    }

    if (nextIndex === sockets.length) {
      nextIndex = this.outerSockets.length;
    }

    const previousSocket = sockets[previousIndex];
    const nextSocket = sockets[nextIndex];

    if (
      !previousSocket.rune &&
      !previousSocket.color &&
      !nextSocket.rune &&
      !nextSocket.color
    ) {
      return true;
    }

    if (
      (previousSocket.rune?.right === rune.left ||
        previousSocket.color?.right === color.left ||
        (!previousSocket.rune && !previousSocket.color)) &&
      (nextSocket.rune?.left === rune.right ||
        nextSocket.color?.left === color.right ||
        (!nextSocket.rune && !nextSocket.color))
    ) {
      return true;
    }

    return false;
  }
}
