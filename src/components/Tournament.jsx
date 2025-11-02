import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import PlayerSlot from './PlayerSlot'
import { SLOT_POSITIONS, IMAGE_WIDTH, IMAGE_HEIGHT, SLOT_WIDTH, SLOT_HEIGHT } from '../tournamentConfig'
import './Tournament.css'

function Tournament({ players, finalPlayers, champion, updatePlayer, advanceToBracket }) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      const windowWidth = window.innerWidth
      const containerPadding = 40
      const availableWidth = windowWidth - containerPadding
      const newScale = Math.min(1, availableWidth / IMAGE_WIDTH)
      setScale(newScale)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Determine match ID and opponent for each slot
  const getMatchInfo = (slotIndex) => {
    const matchMap = {
      0: { matchId: 'qf0', opponentSlot: 1 },
      1: { matchId: 'qf0', opponentSlot: 0 },
      2: { matchId: 'sf0', opponentSlot: 5 },
      3: { matchId: 'qf1', opponentSlot: 4 },
      4: { matchId: 'qf1', opponentSlot: 3 },
      5: { matchId: 'sf0', opponentSlot: 2 },
      6: { matchId: 'qf2', opponentSlot: 7 },
      7: { matchId: 'qf2', opponentSlot: 6 },
      8: { matchId: 'sf1', opponentSlot: 11 },
      9: { matchId: 'qf3', opponentSlot: 10 },
      10: { matchId: 'qf3', opponentSlot: 9 },
      11: { matchId: 'sf1', opponentSlot: 8 },
    }
    return matchMap[slotIndex]
  }

  const canAdvanceToBracket = (slotIndex) => {
    const position = SLOT_POSITIONS[slotIndex]
    if (position.isInput) {
      // Can advance if player has name
      return !!players[slotIndex]
    } else {
      // For bracket slots, can advance if both players in match have names
      const { opponentSlot } = getMatchInfo(slotIndex)
      return !!players[slotIndex] && !!players[opponentSlot]
    }
  }

  return (
    <div className="tournament-container">
      <div className="tournament-bracket-absolute" style={{
        width: `${IMAGE_WIDTH}px`,
        height: `${IMAGE_HEIGHT}px`,
        position: 'relative',
        transform: `scale(${scale})`,
        transformOrigin: 'top center'
      }}>
        {/* Render all 12 slots at their exact positions */}
        {SLOT_POSITIONS.map((position) => (
          <div
            key={position.slot}
            style={{
              position: 'absolute',
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${SLOT_WIDTH}px`,
              height: `${SLOT_HEIGHT}px`
            }}
          >
            <PlayerSlot
              name={players[position.slot]}
              placeholder={position.isInput ? `出場者 ${position.slot + 1}` : ''}
              isInput={position.isInput}
              onNameChange={(name) => updatePlayer(position.slot, name)}
              onSelect={() => {
                const { matchId } = getMatchInfo(position.slot)
                advanceToBracket(matchId, position.slot)
              }}
              disabled={!canAdvanceToBracket(position.slot)}
              buttonText="勝"
              animateEntry={!position.isInput && players[position.slot]}
            />
          </div>
        ))}

        {/* Final match - positioned at center */}
        <div className="final-section">
          <div className="center-decoration">技竜</div>

          <div className="final-match">
            <PlayerSlot
              name={finalPlayers[0]}
              isInput={false}
              onSelect={() => advanceToBracket('final', 0)}
              disabled={!finalPlayers[0] || !finalPlayers[1]}
              buttonText="優勝"
              animateEntry={finalPlayers[0]}
            />
            <PlayerSlot
              name={finalPlayers[1]}
              isInput={false}
              onSelect={() => advanceToBracket('final', 1)}
              disabled={!finalPlayers[0] || !finalPlayers[1]}
              buttonText="優勝"
              animateEntry={finalPlayers[1]}
            />
          </div>

          <AnimatePresence>
            {champion && (
              <motion.div
                className="winner-display"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, ease: "backOut" }}
              >
                <motion.div
                  className="trophy"
                  initial={{ rotate: 0, scale: 0 }}
                  animate={{ rotate: 360, scale: 1 }}
                  transition={{ duration: 1, ease: "elasticOut" }}
                >
                  🏆
                </motion.div>
                <motion.div
                  className="champion-name"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  {champion}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Tournament
