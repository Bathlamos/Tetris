import {observable, computed} from 'mobx';

const red    = 'red',
      blue   = 'blue',
      green  = 'green',
      purple = 'purple',
      white  = 'white',
      yellow = 'yellow',
      orange = 'orange';

class Block {
  @observable color: string;
  @observable x: number;
  @observable y: number;

  static fromCoordinates(color: string, coordinates: Array<number>) {
    var blocks: Array<Block> = [];
    for (var i = 0; i < coordinates.length; i += 2) {
      blocks.push({color: color, x: coordinates[i], y: coordinates[i + 1]});
    }
    return blocks;
  }
}

export enum Key {
  Up, Down, Left, Right
}

class KeyEvent {
  key: Key;
}

class Tetromino {
  @observable blocks: Array<Block>;
  @observable x: number = 3;
  @observable y: number = 0;

  @computed get bounds() {
    return Tetromino.boundingBox(this.blocks);
  }

  static boundingBox(blocks: Array<Block>) {
    return {
      minX: blocks.reduce((acc, val) => Math.min(acc, val.x), Number.POSITIVE_INFINITY),
      minY: blocks.reduce((acc, val) => Math.min(acc, val.y), Number.POSITIVE_INFINITY),
      maxX: blocks.reduce((acc, val) => Math.max(acc, val.x), Number.NEGATIVE_INFINITY),
      maxY: blocks.reduce((acc, val) => Math.max(acc, val.y), Number.NEGATIVE_INFINITY)
    };
  }
}

class I extends Tetromino {
  blocks = Block.fromCoordinates(white, [1, 0, 1, 1, 1, 2, 1, 3]);
}

class T extends Tetromino {
  blocks = Block.fromCoordinates(purple, [1, 1, 0, 2, 1, 2, 2, 2]);
}

class Z extends Tetromino {
  blocks = Block.fromCoordinates(red, [0, 1, 1, 1, 1, 0, 2, 0]);
}

class S extends Tetromino {
  blocks = Block.fromCoordinates(green, [0, 0, 1, 0, 1, 1, 2, 1]);
}

class L extends Tetromino {
  blocks = Block.fromCoordinates(orange, [0, 0, 1, 0, 2, 0, 2, 1]);
}

class J extends Tetromino {
  blocks = Block.fromCoordinates(blue, [0, 1, 1, 1, 2, 1, 2, 0]);
}

class O extends Tetromino {
  blocks = Block.fromCoordinates(yellow, [0, 0, 1, 1, 0, 1, 1, 0]);
}

export class Store {
  static tetrominoQueueLength = 3;

  @observable blocks: Array<Block> = [];
  @observable fallingTetromino: Tetromino;
  @observable tetrominoQueue: Array<Tetromino> = [];
  @observable score: number = 0;
  @observable isHighscore: boolean = false;
  interval: number;

  constructor() {
    this.startGameLoop();
  }

  @computed get blockColorAsMap() {
    let blocks: string[] = new Array(200);
    blocks.fill('board-square', 0, 200);

    this.blocks.forEach((b) => {
      blocks[b.x + 10 * b.y] += ' ' + b.color;
    });

    return Object.freeze(blocks);
  }

  @computed get blockMap() {
    return this.blockColorAsMap.map((s) => s !== 'board-square');
  }

  dispatch(event: KeyEvent) {
    if (!this.isGameOn()) {
      return;
    }
    switch (event.key) {
      case Key.Up: {
        this.rotateTetromino();
        break;
      } case Key.Left: {
        this.moveTetrominoLeft();
        break;
      }
      case Key.Right: {
        this.moveTetrominoRight();
        break;
      }
      default: { /* Key.Down */
        this.moveTetrominoDown();
      }
    }
  }

  randomTetromino(): Tetromino {
    switch (Math.floor(7 * Math.random())) {
      case 0: { return new L(); }
      case 1: { return new O(); }
      case 2: { return new S(); }
      case 3: { return new T(); }
      case 4: { return new J(); }
      case 5: { return new I(); }
      default: { return new Z(); }
    }
  }

  rotateTetromino() {
    let f = this.fallingTetromino;
    if (f instanceof O) {
      return;
    }
    var newBlocks = f.blocks.map((b) => Object.assign({}, b));
    newBlocks.forEach((b) => {
      [b.x, b.y] = [b.y, -b.x + 2];
    });

    // Update the blocks and check for out of bounds
    let bounds = Tetromino.boundingBox(newBlocks);
    newBlocks.forEach((b) => {
      if (f.x + bounds.minX < 0) {
        b.x -= f.x + bounds.minX;
      } else if (f.x + bounds.maxX > 9) {
        b.x -= f.x + bounds.maxX - 9;
      }
    });

    // Don't rotate if there is a collision
    let map = this.blockMap;
    if (newBlocks.every((b) => !map[f.x + b.x + 10 * (f.y + b.y)])) {
      f.blocks = newBlocks;
    }
  }

  moveTetrominoRight() {
    let t = this.fallingTetromino;
    let map = this.blockMap;
    if (t.x + t.bounds.maxX < 9 &&
      !t.blocks.some((b) => map[t.x + b.x + 1 + 10 * (t.y + b.y)])) {
      t.x += 1;
    }
  }

  moveTetrominoLeft() {
    let t = this.fallingTetromino;
    let map = this.blockMap;
    if (t.x + t.bounds.minX > 0 &&
      !t.blocks.some((b) => map[t.x + b.x - 1 + 10 * (t.y + b.y)])) {
      t.x -= 1;
    }
  }

  moveTetrominoDown() {
    let t = this.fallingTetromino;
    if (this.canTetrominoMoveDown()) {
      t.y += 1;
    } else {
      if (this.fallingTetromino.y === 0) {
        return this.onLost();
      }

      // Convert the falling tetromino to blocks and spawn a new one.
      // Check for removing a line

      t.blocks.forEach((b) => {
        b.x += t.x;
        b.y += t.y;
        this.blocks.push(b);
      });

      let numLinesCleared = 0
      for (var i = 0; i < 20; i++) {
        if (this.blockMap.slice(i * 10, i * 10 + 10).reduce((acc, val) => acc && val, true)) {
          numLinesCleared += 1;
          this.blocks = this.blocks.filter((b) => b.y !== i);
          this.blocks.forEach((b) => {
            if (b.y < i) {
              b.y += 1;
            }
          });
        }

        this.score += 40 * numLinesCleared;
      }

      this.tetrominoQueue.push(this.randomTetromino());
      this.fallingTetromino = this.tetrominoQueue.shift() || this.randomTetromino();
    }
  }

  canTetrominoMoveDown() {
    let t = this.fallingTetromino;
    let map = this.blockMap;
    return t.bounds.maxY + t.y < 19 &&
      !t.blocks.some((b) => map[t.x + b.x + 10 * (t.y + b.y + 1)]);
  }

  startGameLoop() {
    if(this.isGameOn()) {
      clearInterval(this.interval);
    }
    this.isHighscore = false;
    this.score = 0;
    this.fallingTetromino = this.randomTetromino();
    let newPieces = [];
    for (var i = 0; i < Store.tetrominoQueueLength; i++) {
      newPieces.push(this.randomTetromino());
    }
    this.tetrominoQueue = newPieces;
    this.blocks = [];
    this.interval = window.setInterval(() => this.moveTetrominoDown(), 500);
    // this.onLost();
  }

  isGameOn() {
    return this.interval !== 0;
  }

  onLost() {
    clearInterval(this.interval);
    this.interval = 0;
    this.blocks = Block.fromCoordinates(red, [
      1, 5, 1, 6, 1, 7, 1, 8, 1, 9, 1, 10, 1, 11, 1, 12, 2, 8, 4, 6, 4, 5, 3,
      7, 3, 9, 4, 10, 4, 11, 4, 12, 8, 5, 8, 6, 8, 7, 8, 8, 8, 9, 8, 10, 8, 11,
      8, 12, 7, 12, 6, 12, 6, 11, 6, 10, 6, 9, 6, 8, 6, 7, 6, 6, 6, 5, 7, 5]);
  }

}
