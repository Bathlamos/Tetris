import * as React from 'react';
import './App.css';
import {Store, Key} from './Store';
import * as Mousetrap from 'mousetrap';
import {observer} from 'mobx-react';

@observer
class App extends React.Component<{store: Store}, {}> {

  componentDidMount() {
    Mousetrap.bind('left', () => this.props.store.dispatch({key: Key.Left}));
    Mousetrap.bind('right', () => this.props.store.dispatch({key: Key.Right}));
    Mousetrap.bind('up', () => this.props.store.dispatch({key: Key.Up}));
    Mousetrap.bind('down', () => this.props.store.dispatch({key: Key.Down}), 'keydown');
    Mousetrap.bind('enter', () => this.props.store.startGameLoop());
  }

  sanitizeInput(e: React.KeyboardEvent<HTMLInputElement>) {
    const re = /[a-zA-Z]+/g;
    if (!re.test(e.key)) {
      e.preventDefault();
    }
  }

  render() {
    let store = this.props.store;

    let blocks: string[] = [];
    Object.assign(blocks, store.blockColorAsMap);

    let nextBlock: string[] = new Array(30);
    nextBlock.fill('board-square five-by-five', 0, 30);

    let queuedBlock: string[] = new Array(60);
    queuedBlock.fill('board-square five-by-five', 0, 60);

    if (store.isGameOn()) {
      store.fallingTetromino.blocks.forEach((b) => {
        let x = store.fallingTetromino.x + b.x;
        let y = store.fallingTetromino.y + b.y;
        blocks[x + 10 * y] += ' ' + b.color;
      });

      var bounds = store.tetrominoQueue[0].bounds;
      var diffX = Math.floor((5 - bounds.maxX - bounds.minX) / 2);
      var diffY = Math.floor((6 - bounds.maxY - bounds.minY) / 2);
      store.tetrominoQueue[0].blocks.forEach((b) => {
        nextBlock[diffX + b.x + 5 * (diffY + b.y)] += ' ' + b.color;
      });

      for (var i = 1; i < 3; i++) {
        bounds = store.tetrominoQueue[i].bounds;
        diffX = Math.floor((5 - bounds.maxX - bounds.minX) / 2);
        diffY = Math.floor((6 - bounds.maxY - bounds.minY) / 2);
        store.tetrominoQueue[i].blocks.forEach((b) => {
          queuedBlock[30 * (i - 1) + diffX + b.x + 5 * (diffY + b.y)] += ' ' + b.color;
        });
      }
    }

    return (
      <div className="app">
        <div className="header" />
        <div className="board">
          <div className="wrapper">
            {blocks.map((s, i) => {
              return <div key={i} className={s} />;
            })}
            {store.isHighscore &&
              <div className="highscore">
                <h2>highscore</h2>
              </div>
            }
            {!store.isGameOn() &&
              <div>
                <input className="highscore-name" autoFocus placeholder="YOUR NAME HERE" maxLength={12} onKeyDown={(e) => this.sanitizeInput(e)} />
                <button className="restart" onClick={() => store.startGameLoop()}/>
                <button className="view-highscore" onClick={() => store.isHighscore = !store.isHighscore}/>
              </div>
            }
          </div>
        </div>
        <div className="side">
          <div className="wrapper">
            <div className="next">
              {nextBlock.map((s, i) => {
                return <div key={i} className={s} />;
              })}
            </div>
            <div className="next-list">
              {queuedBlock.map((s, i) => {
                return <div key={i} className={s} />;
              })}
            </div>
          </div>
        </div>
        <div className="score">{numberWithCommas(store.score)}</div>
      </div>
    );
  }
}

function numberWithCommas(x: number) {
    var y = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(y))
        y = y.replace(pattern, "$1,$2");
    return y;
}

export default App;
