import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// These are the milestone tiers I added - players unlock these by reaching score thresholds on the blockchain.
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

// This finds the next tier above the player's current score so we can show progress towards it.
const getNextTier = (score) => {
  const sorted = [...TIERS].sort((a, b) => a.minScore - b.minScore);
  return sorted.find((t) => t.minScore > score) || null;
};

const nftThresholds = [
  { tier: "BRONZE NFT", points: "1,000", passes: "2,500,000" },
  { tier: "SILVER NFT", points: "5,000", passes: "1,250,000" },
  { tier: "GOLD NFT", points: "20,000", passes: "500,000" },
  { tier: "PLATINUM NFT", points: "40,000", passes: "250,000" },
  { tier: "DIAMOND NFT", points: "60,000", passes: "125,000" },
  { tier: "MASTER NFT", points: "80,000", passes: "50,000" },
  { tier: "GRANDMASTER NFT", points: "150,000", passes: "25,000" },
  { tier: "LEGENDARY NFT", points: "300,000", passes: "15,000" },
  { tier: "MYTHIC NFT", points: "500,000", passes: "5,000" },
  { tier: "OG NFT", points: "1,000,000", passes: "1,000" },
  { tier: "TeaDice OG", points: "100,000,000", passes: "UNLIMITED" },
];

const PlayDice = ({ diceGameContract, account }) => {
  const [displayedDice, setDisplayedDice] = useState(null);
  const [finalDice, setFinalDice] = useState(null);
  const [score, setScore] = useState(0);
  const [rolling, setRolling] = useState(false);

  // This fetches the player's current score from the smart contract when the page loads.
  useEffect(() => {
    if (diceGameContract && account) {
      diceGameContract
        .getUserScore(account)
        .then((result) => setScore(Number(result)))
        .catch(console.error);
    }
  }, [diceGameContract, account]);

  const rollDice = async () => {
    if (!diceGameContract) {
      toast.error("WALLET NOT CONNECTED!");
      return;
    }
    try {
      setRolling(true);
      setFinalDice(null);

      // This animates the dice display while waiting for the blockchain transaction to confirm.
      const animationInterval = setInterval(() => {
        const randomDisplay = Math.floor(Math.random() * 39);
        setDisplayedDice(randomDisplay);
      }, 100);

      // This sends the rollDice transaction to the smart contract on the Tea Sepolia blockchain.
      const tx = await diceGameContract.rollDice();
      const receipt = await tx.wait();

      // This parses the DiceRolled event from the transaction receipt to get the actual dice result and new score.
      // The event is emitted by the smart contract and contains the player address, dice result and updated score.
      let diceResult = null;
      let newScore = null;
      if (receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsedLog = diceGameContract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === "DiceRolled") {
              // I fixed a bug here - the original code never set finalDice so it always showed null after rolling.
              diceResult = Number(parsedLog.args.diceResult);
              newScore = parsedLog.args.newScore;
            }
          } catch (e) {}
        }
      }

      clearInterval(animationInterval);

      // I fixed the bug here - finalDice is now correctly set from the on-chain event result.
      if (diceResult !== null) {
        setFinalDice(diceResult);
      }

      setRolling(false);

      if (newScore) {
        const numScore = Number(newScore);
        setScore(numScore);

        // I added special messages for the unique dice outcomes (0=reset, 37=double, 38=halve).
        let resultMsg = `You rolled a ${diceResult}.`;
        if (diceResult === 0) resultMsg = "💀 Rolled 0! Better luck next time!";
        else if (diceResult === 37) resultMsg = "🔥 Score DOUBLED!";
        else if (diceResult === 38) resultMsg = "💀 Score HALVED!";

        Swal.fire(
          "DICE ROLLED!",
          `${resultMsg} YOUR NEW SCORE IS ${numScore}`,
          "success"
        );
      } else {
        const updatedScore = await diceGameContract.getUserScore(account);
        setScore(Number(updatedScore));
      }
    } catch (error) {
      console.error(error);
      toast.error("DICE ROLL FAILED!");
      setRolling(false);
    }
  };

  // This works out the player's current tier and progress towards the next one.
  const currentTier = getTier(score);
  const nextTier = getNextTier(score);
  const progressToNext = nextTier
    ? Math.min(
        ((score - currentTier.minScore) /
          (nextTier.minScore - currentTier.minScore)) *
          100,
        100
      )
    : 100;

  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center px-4 space-y-8">
      <h2 className="text-4xl mb-6">PLAY DICE</h2>

      {/* I added a tier badge that shows the player's current tier based on their on-chain score. */}
      <div
        className="text-center px-6 py-3 rounded-lg border-2"
        style={{ borderColor: currentTier.color, color: currentTier.color }}
      >
        <span className="text-2xl mr-2">{currentTier.emoji}</span>
        <span className="text-xl font-bold uppercase">{currentTier.tier}</span>
      </div>

      {/* I added a progress bar showing how far the player is from reaching the next tier. */}
      <div className="w-full max-w-sm space-y-2">
        <div className="text-2xl text-center">YOUR SCORE: {score} XP</div>
        {nextTier && (
          <>
            <div className="text-sm text-center text-gray-400">
              {nextTier.minScore - score} XP to reach {nextTier.tier} {nextTier.emoji}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${progressToNext}%`,
                  backgroundColor: nextTier.color,
                }}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col items-center space-y-4">
        {/* I changed the dice display to a proper box to make it clearer */}
        <div className="text-6xl w-24 h-24 flex items-center justify-center border-2 border-[#a855f7] rounded-xl">
          {rolling ? displayedDice : finalDice !== null ? finalDice : "?"}
        </div>
        <div className="text-2xl">YOUR SCORE: {score} XP</div>
        <motion.button
          onClick={rollDice}
          disabled={rolling}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          // I changed the button colour to purple and added a disabled state so it cant be clicked while rolling.
          className="px-6 py-3 rounded uppercase text-xl text-white disabled:opacity-50"
          style={{ background: "#a855f7" }}
        >
          {rolling ? "ROLLING..." : "ROLL DICE"}
        </motion.button>
      </div>

      {/* I added a tier ladder so players can see all the milestones and which ones they've unlocked. */}
      <div className="w-full max-w-md">
        <h3 className="text-xl text-center mb-4 uppercase">Tier Ladder</h3>
        <div className="space-y-2">
          {TIERS.map((t) => (
            <div
              key={t.tier}
              className="flex justify-between items-center px-4 py-2 rounded"
              style={{
                background: score >= t.minScore ? `${t.color}22` : "transparent",
                border: `1px solid ${score >= t.minScore ? t.color : "#444"}`,
              }}
            >
              <span style={{ color: score >= t.minScore ? t.color : "#888" }}>
                {t.emoji} {t.tier}
              </span>
              <span className="text-sm text-gray-400">
                {t.minScore.toLocaleString()} XP
              </span>
              {score >= t.minScore && (
                <span className="text-xs" style={{ color: t.color }}>
                  ✓ UNLOCKED
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* This explains the special dice outcomes to the player. */}
      <div className="w-full max-w-md text-sm text-gray-400 text-center pb-8">
        <p>
          🎲 Roll 1–36: Add to score | 37: Double score | 38: Halve score | 0: Reset score
        </p>
      </div>
    </motion.div>
  );
};

export default PlayDice;
