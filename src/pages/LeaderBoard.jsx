import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// These are the tier colours I added so leaderboard rows highlight based on each player's score.
const TIER_COLORS = [
  { minScore: 5000, color: "#ff6b35", emoji: "👑" },
  { minScore: 3600, color: "#b9f2ff", emoji: "💎" },
  { minScore: 1800, color: "#e5e4e2", emoji: "🏆" },
  { minScore: 900, color: "#ffd700", emoji: "🥇" },
  { minScore: 500, color: "#c0c0c0", emoji: "🥈" },
  { minScore: 250, color: "#cd7f32", emoji: "🥉" },
];

// This works out the tier colour and emoji for a given score.
const getTier = (score) => {
  for (const t of TIER_COLORS) {
    if (score >= t.minScore) return t;
  }
  return { color: "#555", emoji: "🎲" };
};

const LeaderBoard = ({ diceGameContract }) => {
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchLeaderboard = async () => {
    if (!diceGameContract) return;
    try {
      // This calls getPlayers() on the smart contract to get all player addresses from the blockchain.
      const players = await diceGameContract.getPlayers();
      console.log(players)
      // This fetches each player's score from the blockchain in parallel using Promise.all.
      const scoresPromises = players.map(async (player) => {
        const score = await diceGameContract.getUserScore(player);
        return { player, score: Number(score) };
      });
      let scoresArray = await Promise.all(scoresPromises);
      scoresArray.sort((a, b) => b.score - a.score);
      setLeaderboard(scoresArray);
    } catch (error) {
      console.error("ERROR FETCHING LEADERBOARD:", error);
    }
  };

  useEffect(() => {
    // This fetches the leaderboard immediately and then polls every 5 seconds to keep it live.
    fetchLeaderboard();
    const intervalId = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(intervalId);
  }, [diceGameContract]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* I changed the heading colour to purple to match the new theme */}
      <h2 className="text-4xl mb-6" style={{ color: "#a855f7" }}>LEADERBOARD</h2>
      <div className="w-full max-w-4xl">
        <table className="w-full text-center">
          <thead>
            {/* I changed the border colour to purple to match the new theme */}
            <tr className="border-b border-[#a855f7]">
              <th className="py-2">RANK</th>
              <th className="py-2">PLAYER</th>
              <th className="py-2">POINTS</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length > 0 ? (
              leaderboard.map((item, index) => {
                // This works out the tier for each player so we can colour their row accordingly.
                const tier = getTier(item.score);
                return (
                  <tr
                    key={item.player}
                    className="border-b border-white/10"
                    style={{ background: index < 3 ? `${tier.color}11` : "transparent" }}
                  >
                    <td className="py-2">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                    </td>
                    <td className="py-2">
                      <a
                        href={`https://sepolia.tea.xyz/address/${item.player}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:underline shadow-white"
                      >
                        {item.player.slice(0, 6)}...{item.player.slice(-4)}
                      </a>
                    </td>
                    <td className="py-2" style={{ color: tier.color }}>
                      {tier.emoji} {item.score}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="py-2" colSpan="3">NO PLAYERS FOUND</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default LeaderBoard;