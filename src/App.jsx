import { useState } from "react";

export default function EscroScoreTracker() {
  // State
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState([]); // ["Ahmed", "Sara", ...]
  const [scores, setScores] = useState([]); // [[0,0,0,..], [..] ] => rounds x players
  const [currentRound, setCurrentRound] = useState(1);

  // Helpers
  const canAddMorePlayers = players.length < 4;
  const canAddRound = players.length > 0;

  const handleAddPlayer = () => {
    const name = playerName.trim();
    if (!name || !canAddMorePlayers) return;

    setPlayers((prev) => {
      const next = [...prev, name];
      // Also extend existing rounds with a new column (0) for this player
      setScores((old) => old.map((r) => [...r, 0]));
      return next;
    });
    setPlayerName("");
  };

  const handleRemovePlayer = (index) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
    setScores((prev) => prev.map((row) => row.filter((_, i) => i !== index)));
  };

  const handleAddRound = () => {
    if (!canAddRound) return;
    setScores((prev) => {
      const newRow = Array(players.length).fill(0);
      return [...prev, newRow];
    });
    setCurrentRound((r) => r + 1);
  };

  const handleReset = () => {
    setPlayerName("");
    setPlayers([]);
    setScores([]);
    setCurrentRound(1);
  };

  const updateScore = (roundIdx, playerIdx, value) => {
    const num = Number(value);
    setScores((prev) => {
      const rows = prev.length
        ? prev
        : Array.from({ length: currentRound }, () =>
            Array(players.length).fill(0)
          );
      const next = rows.map((row) => [...row]);
      if (!next[roundIdx]) next[roundIdx] = Array(players.length).fill(0);
      next[roundIdx][playerIdx] = Number.isFinite(num) ? num : 0;
      return next;
    });
  };

  // Build data for render
  const rowsToRender = scores.length
    ? scores
    : Array.from({ length: currentRound }, () => Array(players.length).fill(0));

  const totals = players.map((_, pIdx) =>
    rowsToRender.reduce((sum, round) => sum + (round?.[pIdx] || 0), 0)
  );
  const maxScore = totals.length ? Math.max(...totals) : 0;
  const minScore = totals.length ? Math.min(...totals) : 0;

  const onKeyDownEnter = (e) => {
    if (e.key === "Enter") handleAddPlayer();
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-6 md:mb-10 text-gray-800 tracking-wide">
          🎯 Escro Score Tracker
        </h1>

        {/* Player Input Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 md:mb-8 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-700">
            ➕ Add Players
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={onKeyDownEnter}
              placeholder="Enter player name"
              disabled={!canAddMorePlayers}
              className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-50"
            />
            <button
              onClick={handleAddPlayer}
              disabled={!canAddMorePlayers}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-4 sm:px-6 py-2 rounded-lg font-medium shadow transition cursor-pointer"
            >
              Add Player
            </button>
          </div>
          {!canAddMorePlayers && (
            <p className="text-red-500 font-medium">
              ⚠️ Maximum 4 players allowed!
            </p>
          )}

          {players.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-700">
              {players.map((p, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                >
                  {p}
                  <button
                    onClick={() => handleRemovePlayer(i)}
                    className="font-bold cursor-pointer"
                  >
                    &#x274c;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Score Table Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 md:mb-8 border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 font-semibold text-left">
                    Round
                  </th>
                  {players.map((p, idx) => (
                    <th
                      key={idx}
                      className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 font-semibold"
                    >
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rowsToRender.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="px-2 sm:px-4 py-2 text-gray-700 font-medium text-left">
                      Round {rIdx + 1}
                    </td>
                    {players.map((_, pIdx) => (
                      <td key={pIdx} className="px-2 sm:px-4 py-2">
                        <input
                          type="number"
                          value={row?.[pIdx] ?? ""}
                          onChange={(e) =>
                            updateScore(rIdx, pIdx, e.target.value)
                          }
                          className="w-16 sm:w-20 text-center px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold text-gray-700 text-left">
                    Total
                  </td>
                  {totals.map((t, i) => (
                    <td
                      key={i}
                      // className={`px-2 sm:px-4 py-2 sm:py-3 font-bold ${
                      //   t === maxScore && players.length > 0
                      //     ? "text-red-500"
                      //     : "text-gray-700"
                      // }`}
                      className={`px-2 sm:px-4 py-2 sm:py-3 font-bold ${
                        players.length > 0
                          ? t === maxScore
                            ? "text-red-500"
                            : t === minScore
                            ? "text-green-600"
                            : "text-gray-700"
                          : "text-gray-700"
                      }`}
                    >
                      {t}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row justify-between gap-3 sm:gap-4">
          <button
            onClick={handleAddRound}
            disabled={!canAddRound}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            ➕ Add Round
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow transition cursor-pointer"
          >
            🔄 Reset Game
          </button>
        </div>
      </div>
    </div>
  );
}
