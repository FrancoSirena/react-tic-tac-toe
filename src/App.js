import * as React from "react";
import "./styles.css";

const SIZE = 5;

class ErrorBoundary extends React.Component {
  state = {
    error: false
  };
  static getDerivedStateFromError(e) {
    console.log(e);
    return { error: true };
  }

  render() {
    if (this.state.error) {
      return <>Error</>;
    }

    return this.props.children;
  }
}

function getStatus(moves) {
  let filled = 0;
  for (let row = 0; row < SIZE; row++) {
    let movesR = {};
    let movesC = {};
    for (let col = 0; col < SIZE; col++) {
      if (moves[row][col]) {
        filled++;
        movesR[moves[row][col]] = (movesR[moves[row][col]] || 0) + 1;
      }
      if (moves[col][row]) {
        movesC[moves[col][row]] = (movesC[moves[col][row]] || 0) + 1;
      }
    }
    const [rowMatch] =
      Object.entries(movesR).find(([, sum]) => sum === SIZE) || [];
    const [colMatch] =
      Object.entries(movesC).find(([, sum]) => sum === SIZE) || [];

    if (rowMatch) {
      return ["DONE", rowMatch, ["R", row]];
    }

    if (colMatch) {
      return ["DONE", colMatch, ["C", row]];
    }
  }

  let moveZR = {};
  let moveZL = {};
  for (let index = 0; index < SIZE; index++) {
    if (moves[index][index]) {
      moveZR[moves[index][index]] = (moveZR[moves[index][index]] || 0) + 1;
    }
    const lCol = index === 0 ? SIZE - 1 : SIZE - 1 - index;
    const lRow = index;

    if (moves[lRow][lCol]) {
      moveZL[moves[lRow][lCol]] = (moveZL[moves[lRow][lCol]] || 0) + 1;
    }
  }

  const [zLeftMatch] =
    Object.entries(moveZR).find(([, sum]) => sum === SIZE) || [];
  const [zRightMatch] =
    Object.entries(moveZL).find(([, sum]) => sum === SIZE) || [];

  if (zLeftMatch) {
    return ["DONE", zLeftMatch, ["Z", 0]];
  }

  if (zRightMatch) {
    return ["DONE", zRightMatch, ["Z", 1]];
  }

  if (filled === Math.pow(SIZE, 2)) {
    return ["DRAW", null, []];
  }
  return ["PLAYING", null, []];
}

const initialStatus = ["PLAYING", null, []];
const initialMoves = Array.from({ length: SIZE }, () =>
  Array.from({ length: SIZE })
);

const Game = () => {
  const [[status, movement, winner = []], setStatus] = React.useState(
    initialStatus
  );
  const [lastMove, setLastMove] = React.useState("X");
  const [moves, setMoves] = React.useState(initialMoves);

  React.useEffect(() => {
    const newStatus = getStatus(moves);
    setStatus(newStatus);
  }, [moves]);

  const [axis, pos] = winner;
  return (
    <>
      <button
        onClick={() => {
          setStatus(initialStatus);
          setMoves(initialMoves);
          setLastMove("X");
        }}
      >
        Restart
      </button>
      {status} {movement}
      {Array.from({ length: SIZE }, (_, r) => (
        <div
          key={`row_${r}`}
          id={`row_${r}`}
          className={`row ${axis === "R" && pos === r ? "winner" : ""}`}
        >
          {Array.from({ length: SIZE }, (_, c) => {
            let paintC = axis === "C" && pos === c;
            if (axis === "Z" && pos === 0) {
              paintC = c === r;
            } else if (axis === "Z" && pos === 1) {
              paintC =
                Math.abs(r - c) === SIZE - 1 ||
                (r === Math.floor(SIZE / 2) && c === Math.floor(SIZE / 2));
            }
            return (
              <div
                role="button"
                key={`box_${r}_${c}`}
                className={`box ${paintC ? "winner" : ""}`}
                onClick={() => {
                  if (status === "DONE") {
                    return;
                  }
                  const move = lastMove === "X" ? "O" : "X";

                  setMoves((prev) => {
                    const newP = [...prev];
                    if (!newP[r][c]) {
                      const arr = [];
                      for (let x = 0; x < SIZE; x++) {
                        arr.push(x === c ? move : newP[r][x]);
                      }
                      newP[r] = arr;
                    }
                    return newP;
                  });
                  setLastMove(move);
                }}
              >
                {moves[r][c]}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <Game />
  </ErrorBoundary>
);

export default App;
