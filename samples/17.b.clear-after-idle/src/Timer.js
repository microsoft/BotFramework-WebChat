import React from "react";

import formatTime from "./utils/formatTime";
import useTimer from "./utils/useTimer";

export default function Timer({ ms, onComplete, setTimeRemaining }) {
  useTimer(ms, onComplete, setTimeRemaining);

  return (
    <div className="timer">
      Time Remaining:{" "}
      <span className={`${ms < 10000 ? "timer-red" : ""}`}>
        {formatTime(ms)}
      </span>
    </div>
  );
}
