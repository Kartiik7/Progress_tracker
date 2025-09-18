import React, { useState } from "react";
import { getLeetCodeStats } from "../api/leetcode";

export default function LeetCodeStats() {
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetchStats = async (e) => {
    e.preventDefault();
    if (!username) {
      setError("Please enter a LeetCode username.");
      return;
    }
    setLoading(true);
    setError("");
    setStats(null);
    try {
      const data = await getLeetCodeStats(username);
      if (data.status === "success") {
        setStats(data);
      } else {
        setError(data.message || "Could not fetch stats.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Widget title="LeetCode Profile Stats">
      <form
        onSubmit={handleFetchStats}
        className="flex items-center gap-2 mb-6"
      >
        <input
          className="p-2 rounded bg-gray-800 border border-gray-700 flex-1"
          placeholder="Enter LeetCode username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Fetching..." : "Get Stats"}
        </button>
      </form>

      {error && (
        <div className="text-red-400 text-center p-4 bg-red-900/50 rounded-lg">
          {error}
        </div>
      )}

      {stats && (
        <div className="animate-fade-in">
          <h3 className="text-xl font-bold text-cyan-400 text-center mb-4">
            Stats for {username}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <StatCard label="Ranking" value={stats.ranking} />
            <StatCard
              label="Total Solved"
              value={stats.totalSolved}
              color="text-green-400"
            />
            <StatCard
              label="Acceptance Rate"
              value={`${parseFloat(stats.acceptanceRate).toFixed(2)}%`}
            />
            <StatCard
              label="Contribution Pts"
              value={stats.contributionPoints}
            />
          </div>
          <div className="mt-6">
            <h4 className="font-semibold text-lg mb-3 text-center">
              Solved by Difficulty
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DifficultyCard
                difficulty="Easy"
                solved={stats.easySolved}
                total={stats.totalEasy}
              />
              <DifficultyCard
                difficulty="Medium"
                solved={stats.mediumSolved}
                total={stats.totalMedium}
              />
              <DifficultyCard
                difficulty="Hard"
                solved={stats.hardSolved}
                total={stats.totalHard}
              />
            </div>
          </div>
        </div>
      )}
    </Widget>
  );
}

// Helper components for displaying stats
const StatCard = ({ label, value, color = "text-white" }) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <div className="text-sm text-gray-400">{label}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
  </div>
);

const DifficultyCard = ({ difficulty, solved, total }) => {
  const percentage = total > 0 ? ((solved / total) * 100).toFixed(1) : 0;
  const colorVariants = {
    Easy: "bg-green-500",
    Medium: "bg-yellow-500",
    Hard: "bg-red-500",
  };
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h5 className="font-bold text-center">{difficulty}</h5>
      <div className="text-center text-xl font-semibold my-2">
        {solved} <span className="text-gray-400 text-sm">/ {total}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className={`${colorVariants[difficulty]} h-2.5 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-center text-xs text-gray-400 mt-1">
        {percentage}%
      </div>
    </div>
  );
};

function Widget({ title, children }) {
  return (
    <section className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }`}</style>
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      {children}
    </section>
  );
}
