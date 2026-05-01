import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// These are the tier thresholds I added so the profile page shows the player's current tier badge.
const TIERS = [
  { tier: "OG", minScore: 5000, color: "#ff6b35", emoji: "👑" },
  { tier: "Diamond", minScore: 3600, color: "#b9f2ff", emoji: "💎" },
  { tier: "Platinum", minScore: 1800, color: "#e5e4e2", emoji: "🏆" },
  { tier: "Gold", minScore: 900, color: "#ffd700", emoji: "🥇" },
  { tier: "Silver", minScore: 500, color: "#c0c0c0", emoji: "🥈" },
  { tier: "Bronze", minScore: 250, color: "#cd7f32", emoji: "🥉" },
];

// This works out which tier the player is currently in based on their score.
const getTier = (score) => {
  for (const t of TIERS) {
    if (score >= t.minScore) return t;
  }
  return { tier: "Unranked", minScore: 0, color: "#888", emoji: "🎲" };
};

const UserProfile = ({ account, diceGameContract }) => {
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState(null);
  const [transactions, setTransactions] = useState([]);
  // I added loading state so the transaction section shows a message while fetching from the blockchain.
  const [loadingTx, setLoadingTx] = useState(false);

  const fetchUserData = async () => {
    if (diceGameContract && account) {
      try {
        const userScore = await diceGameContract.getUserScore(account);
        setScore(Number(userScore));
        const players = await diceGameContract.getPlayers();
        const scoresPromises = players.map(async (player) => {
          const score = await diceGameContract.getUserScore(player);
          return { player, score: Number(score) };
        });
        let scoresArray = await Promise.all(scoresPromises);
        scoresArray.sort((a, b) => b.score - a.score);
        const userRank = scoresArray.findIndex(
          (item) => item.player.toLowerCase() === account.toLowerCase()
        ) + 1;
        setRank(userRank);
      } catch (error) {
        console.error("ERROR FETCHING USER DATA:", error);
      }
    }
  };

  // This fetches the player's recent DiceRolled events directly from the blockchain event logs.
  const fetchTransactions = async () => {
    if (!diceGameContract || !account) return;
    setLoadingTx(true);
    try {
      // This uses queryFilter to search for DiceRolled events from this player's address on the blockchain.
      const filter = diceGameContract.filters.DiceRolled(account);
      const events = await diceGameContract.queryFilter(filter, -10000);
      const txList = events
        .slice(-10)
        .reverse()
        .map((e) => ({
          hash: e.transactionHash,
          diceResult: Number(e.args.diceResult),
          newScore: Number(e.args.newScore),
          shortHash: `${e.transactionHash.slice(0, 8)}...${e.transactionHash.slice(-6)}`,
        }));
      setTransactions(txList);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    // Fetch data immediately and poll every 5 seconds
    fetchUserData();
    fetchTransactions();
    const intervalId = setInterval(fetchUserData, 5000);
    return () => clearInterval(intervalId);
  }, [diceGameContract, account]);

  // This works out the player's current tier to show on their profile.
  const currentTier = getTier(score);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* I changed the heading colour to purple to match the new theme */}
      <h2 className="text-4xl mb-6" style={{ color: "#a855f7" }}>YOUR PROFILE</h2>
      <p className="mb-4 text-2xl">WALLET: {account}</p>
      <p className="mb-4 text-2xl">SCORE: {score}</p>
      <p className="mb-8 text-2xl">RANK: {rank ? rank : "-"}</p>

      {/* I added a tier badge so the player can see their current milestone status on their profile */}
      <div
        className="mb-8 px-6 py-3 rounded-lg border-2 text-center"
        style={{ borderColor: currentTier.color, color: currentTier.color }}
      >
        <span className="text-2xl mr-2">{currentTier.emoji}</span>
        <span className="text-xl font-bold uppercase">{currentTier.tier}</span>
      </div>

      {/* I uncommented and rebuilt the transaction section to fetch real roll history from blockchain events */}
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-3xl">LAST 10 ROLLS</h3>
          <button
            onClick={fetchTransactions}
            className="text-sm border border-[#a855f7] text-[#a855f7] px-3 py-1 rounded"
          >
            Refresh
          </button>
        </div>
        {loadingTx ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p>NO TRANSACTIONS YET.</p>
        ) : (
          <ul>
            {transactions.map((tx, index) => (
              <li key={index} className="flex justify-between items-center border border-white/10 rounded px-4 py-2 mb-2">
                <div>
                  <span className="text-gray-400 text-sm">Rolled: </span>
                  <span className="font-bold">{tx.diceResult}</span>
                  <span className="text-gray-400 text-sm ml-3">Score: </span>
                  <span className="font-bold" style={{ color: "#a855f7" }}>{tx.newScore}</span>
                </div>
                <a
                  href={`https://sepolia.tea.xyz/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline"
                >
                  {tx.shortHash} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="w-full max-w-md mt-8">
        <h3 className="text-3xl mb-4">YOUR NFTS</h3>
        <p>NFTS YOU MINT WILL APPEAR HERE.</p>
      </div>
    </motion.div>
  );
};

export default UserProfile;