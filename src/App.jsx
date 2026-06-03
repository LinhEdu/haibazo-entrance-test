import { useEffect, useState } from "react";
import "./App.css";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 520;
const POINT_SIZE = 42;
const REMOVE_SECONDS = 3.0;

function createPoints(total) {
  const result = [];

  for (let i = 1; i <= total; i++) {
    result.push({
      id: i,
      number: i,
      x: Math.random() * (GAME_WIDTH - POINT_SIZE),
      y: Math.random() * (GAME_HEIGHT - POINT_SIZE),
      status: "normal",
      remaining: REMOVE_SECONDS,
    });
  }

  return result;
}

function App() {
  const [pointCount, setPointCount] = useState(5);
  const [points, setPoints] = useState([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [gameStatus, setGameStatus] = useState("idle");
  const [time, setTime] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  function handleStart() {
    const total = Number(pointCount);

    if (!Number.isInteger(total) || total <= 0) {
      alert("Please enter a valid number");
      return;
    }

    setPoints(createPoints(total));
    setNextNumber(1);
    setHasStarted(true);
    setGameStatus("playing");
    setTime(0);
    setAutoPlay(false);
  }

  function handlePointClick(point) {
    if (gameStatus !== "playing") return;
    if (point.status === "removing") return;

    if (point.number !== nextNumber) {
      setGameStatus("gameover");
      setAutoPlay(false);
      return;
    }

    setPoints((currentPoints) =>
      currentPoints.map((p) => {
        if (p.id === point.id) {
          return {
            ...p,
            status: "removing",
            remaining: REMOVE_SECONDS,
          };
        }

        return p;
      })
    );

    setNextNumber((prev) => prev + 1);

    setTimeout(() => {
      setPoints((currentPoints) => {
        const remainingPoints = currentPoints.filter((p) => p.id !== point.id);

        if (remainingPoints.length === 0) {
          setGameStatus("cleared");
          setAutoPlay(false);
        }

        return remainingPoints;
      });
    }, REMOVE_SECONDS * 1000);
  }

  useEffect(() => {
    if (gameStatus !== "playing") return;

    const timer = setInterval(() => {
      setTime((prev) => Number((prev + 0.1).toFixed(1)));
    }, 100);

    return () => clearInterval(timer);
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus !== "playing") return;

    const countdown = setInterval(() => {
      setPoints((currentPoints) => {
        const hasRemovingPoint = currentPoints.some(
          (point) => point.status === "removing"
        );

        if (!hasRemovingPoint) {
          return currentPoints;
        }

        return currentPoints.map((point) => {
          if (point.status !== "removing") return point;

          return {
            ...point,
            remaining: Math.max(
              0,
              Number((point.remaining - 0.1).toFixed(1))
            ),
          };
        });
      });
    }, 100);

    return () => clearInterval(countdown);
  }, [gameStatus]);

  useEffect(() => {
    if (!autoPlay || gameStatus !== "playing") return;

    const nextPoint = points.find(
      (point) => point.number === nextNumber && point.status === "normal"
    );

    if (!nextPoint) return;

    const autoTimer = setTimeout(() => {
      handlePointClick(nextPoint);
    }, 500);

    return () => clearTimeout(autoTimer);
  }, [autoPlay, gameStatus, nextNumber]);

  function getTitle() {
    if (gameStatus === "gameover") return "GAME OVER";
    if (gameStatus === "cleared") return "ALL CLEARED";
    return "LET'S PLAY";
  }

  return (
    <div className="app">
      <h1
        className={
          gameStatus === "gameover"
            ? "gameover"
            : gameStatus === "cleared"
            ? "cleared"
            : ""
        }
      >
        {getTitle()}
      </h1>

      <div className="row">
        <label>Points:</label>
        <input
          type="number"
          value={pointCount}
          onChange={(e) => setPointCount(e.target.value)}
          disabled={gameStatus === "playing"}
        />
      </div>

      <div className="row">
        <label>Time:</label>
        <span>{time.toFixed(1)}s</span>
      </div>

      <div className="button-row">
        <button onClick={handleStart}>
          {hasStarted ? "Restart" : "Start"}
        </button>

        {gameStatus === "playing" && points.length > 0 && (
          <button onClick={() => setAutoPlay((prev) => !prev)}>
            Auto Play {autoPlay ? "ON" : "OFF"}
          </button>
        )}
      </div>

      <div className="game-area">
        {points.map((point) => (
          <button
            key={point.id}
            className={`point ${
              point.status === "removing" ? "removing" : ""
            }`}
            style={{
              left: point.x,
              top: point.y,
            }}
            onClick={() => handlePointClick(point)}
          >
            <span>{point.number}</span>

            {point.status === "removing" && (
              <small>{point.remaining.toFixed(1)}s</small>
            )}
          </button>
        ))}
      </div>

      {hasStarted && <div className="next">Next: {nextNumber}</div>}
    </div>
  );
}

export default App;