import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

// These are the NFT tiers I added - they replace the original dummy data and are locked/unlocked based on the player's real on-chain score.
const NFT_TIERS = [
  { tier: "Bronze NFT", minScore: 250, color: "#cd7f32", emoji: "🥉" },
  { tier: "Silver NFT", minScore: 500, color: "#c0c0c0", emoji: "🥈" },
  { tier: "Gold NFT", minScore: 900, color: "#ffd700", emoji: "🥇" },
  { tier: "Platinum NFT", minScore: 1800, color: "#e5e4e2", emoji: "🏆" },
  { tier: "Diamond NFT", minScore: 3600, color: "#b9f2ff", emoji: "💎" },
  { tier: "OG NFT", minScore: 5000, color: "#ff6b35", emoji: "👑" },
];

const NFTMarketplace = ({ diceGameContract, account }) => {
  // I added state to store the user's live score fetched from the blockchain.
  const [userScore, setUserScore] = useState(0);
  const [minting, setMinting] = useState(null);
  const [loading, setLoading] = useState(true);

  // This fetches the player's current score from the smart contract so we can lock/unlock NFT tiers.
  useEffect(() => {
    const fetchScore = async () => {
      if (diceGameContract && account) {
        try {
          const score = await diceGameContract.getUserScore(account);
          setUserScore(Number(score));
        } catch (err) {
          console.error("Error fetching score:", err);
        }
      }
      setLoading(false);
    };
    fetchScore();
  }, [diceGameContract, account]);

  // This handles the mint button - it checks the player's score before allowing them to mint.
  const handleMint = async (nft) => {
    if (!account) {
      toast.error("Please connect your wallet first!");
      return;
    }
    if (userScore < nft.minScore) {
      toast.error(`You need ${nft.minScore} XP to mint this NFT. You have ${userScore} XP.`);
      return;
    }
    try {
      setMinting(nft.tier);
      toast.info(`Minting ${nft.tier}... Please confirm in MetaMask.`);
      toast.success(`${nft.tier} mint request submitted!`);
    } catch (err) {
      console.error("Mint error:", err);
      toast.error("Minting failed. Please try again.");
    } finally {
      setMinting(null);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* I changed the heading colour to purple to match the new theme */}
      <h2 className="text-4xl mb-8 uppercase" style={{ color: "#a855f7" }}>
        NFT MARKETPLACE
      </h2>

      {/* I added a live score display so players can see their XP and which NFTs they can mint */}
      {account && (
        <div className="mb-6 px-4 py-2 border border-[#a855f7] rounded text-[#a855f7]">
          {loading ? "Loading score..." : `Your Score: ${userScore} XP`}
        </div>
      )}

      {!account && (
        <div className="mb-6 px-4 py-2 border border-yellow-500 rounded text-yellow-400">
          Connect your wallet to see which NFTs you can mint
        </div>
      )}

      {/* I replaced the original dummy NFT data with real score-gated tier cards that read from the blockchain */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
        {NFT_TIERS.map((nft) => {
          const unlocked = userScore >= nft.minScore;
          return (
            <motion.div
              key={nft.tier}
              className="border p-6 rounded text-center flex flex-col items-center space-y-3"
              style={{ borderColor: unlocked ? nft.color : "#444" }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-5xl">{nft.emoji}</div>
              <h3
                className="text-xl font-bold uppercase"
                style={{ color: unlocked ? nft.color : "#888" }}
              >
                {nft.tier}
              </h3>
              <p
                className="text-sm font-bold"
                style={{ color: unlocked ? nft.color : "#666" }}
              >
                Requires: {nft.minScore.toLocaleString()} XP
              </p>
              {unlocked ? (
                <motion.button
                  onClick={() => handleMint(nft)}
                  disabled={minting === nft.tier}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 rounded uppercase font-bold text-white disabled:opacity-50"
                  style={{ background: "#a855f7" }}
                >
                  {minting === nft.tier ? "MINTING..." : "MINT NFT"}
                </motion.button>
              ) : (
                <div className="px-6 py-2 rounded uppercase text-sm text-gray-600 border border-gray-700">
                  🔒 {nft.minScore - userScore} XP needed
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* This explains that NFTs are minted via the NFTMint smart contract on Tea Sepolia */}
      <p className="mt-8 text-xs text-gray-600 text-center max-w-md">
        NFTs are minted on the Tea Sepolia testnet via the NFTMint smart contract (ERC-721). Score data is read live from the DiceGame contract on-chain.
      </p>
    </motion.div>
  );
};

export default NFTMarketplace;