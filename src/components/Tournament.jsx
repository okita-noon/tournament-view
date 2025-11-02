import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import PlayerSlot from './PlayerSlot'
import { SLOT_POSITIONS, QF_WINNER_POSITIONS, SF_WINNER_POSITIONS, IMAGE_WIDTH, IMAGE_HEIGHT, SLOT_WIDTH, SLOT_HEIGHT } from '../tournamentConfig'
import './Tournament.css'

function Tournament({ players, qfWinners, sfWinners, finalPlayers, champion, updatePlayer, advanceToBracket }) {
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
      // Round 1: Quarter Finals
      1: { matchId: 'qf0', opponentSlot: 2 },
      2: { matchId: 'qf0', opponentSlot: 1 },
      3: { matchId: 'qf1', opponentSlot: 4 },
      4: { matchId: 'qf1', opponentSlot: 3 },
      7: { matchId: 'qf2', opponentSlot: 8 },
      8: { matchId: 'qf2', opponentSlot: 7 },
      9: { matchId: 'qf3', opponentSlot: 10 },
      10: { matchId: 'qf3', opponentSlot: 9 },
      // Round 2: Seeded players (vs QF winners)
      0: { matchId: 'sf0', opponentSlot: -1 }, // vs qfWinners[0]
      5: { matchId: 'sf1', opponentSlot: -1 }, // vs qfWinners[1]
      6: { matchId: 'sf2', opponentSlot: -1 }, // vs qfWinners[2]
      11: { matchId: 'sf3', opponentSlot: -1 }, // vs qfWinners[3]
    }
    return matchMap[slotIndex]
  }

  const canAdvanceToBracket = (slotIndex) => {
    // Round 1 (QF): slots 1,2,3,4,7,8,9,10
    if ([1, 2, 3, 4, 7, 8, 9, 10].includes(slotIndex)) {
      return true
    }

    // Round 2 (SF): Seeded players (slots 0,5,6,11)
    // They can advance anytime (opponent existence not required)
    if (slotIndex === 0) return true
    if (slotIndex === 5) return true
    if (slotIndex === 6) return true
    if (slotIndex === 11) return true

    return false
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
                advanceToBracket(matchId, players[position.slot])
              }}
              disabled={!canAdvanceToBracket(position.slot)}
              buttonText="勝"
              animateEntry={!position.isInput && players[position.slot]}
            />
          </div>
        ))}

        {/* QF Winners - display only when winner exists */}
        <AnimatePresence>
          {QF_WINNER_POSITIONS.map((position) =>
            qfWinners[position.index] ? (
              <motion.div
                key={`qf-winner-${position.index}`}
                initial={{ opacity: 0, scale: 0.5, x: -100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                style={{
                  position: 'absolute',
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  width: `${SLOT_WIDTH}px`,
                  height: `${SLOT_HEIGHT}px`
                }}
              >
                <PlayerSlot
                  name={qfWinners[position.index]}
                  isInput={false}
                  onSelect={() => advanceToBracket(`sf${position.index}`, qfWinners[position.index])}
                  disabled={false}
                  buttonText="勝"
                  animateEntry={false}
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* SF Winners - display only when winner exists */}
        <AnimatePresence>
          {SF_WINNER_POSITIONS.map((position) =>
            sfWinners[position.index] ? (
              <motion.div
                key={`sf-winner-${position.index}`}
                initial={{ opacity: 0, scale: 0.5, x: position.index < 2 ? -80 : 80 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                style={{
                  position: 'absolute',
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  width: `${SLOT_WIDTH}px`,
                  height: `${SLOT_HEIGHT}px`
                }}
              >
                <PlayerSlot
                  name={sfWinners[position.index]}
                  isInput={false}
                  onSelect={() => {
                    // SF0, SF1 → semi0 (finalPlayers[0])
                    // SF2, SF3 → semi1 (finalPlayers[1])
                    const matchId = position.index < 2 ? 'semi0' : 'semi1'
                    advanceToBracket(matchId, sfWinners[position.index])
                  }}
                  disabled={false}
                  buttonText="勝"
                  animateEntry={false}
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Final match - positioned at center */}
        <div className="final-section">
          <div className="final-match">
            <AnimatePresence>
              {finalPlayers[0] && (
                <motion.div
                  key="final-player-0"
                  initial={{ opacity: 0, scale: 0.5, x: -100 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.5, ease: "backOut" }}
                >
                  <PlayerSlot
                    name={finalPlayers[0]}
                    isInput={false}
                    onSelect={() => advanceToBracket('final', finalPlayers[0])}
                    disabled={false}
                    buttonText="優勝"
                    animateEntry={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {finalPlayers[1] && (
                <motion.div
                  key="final-player-1"
                  initial={{ opacity: 0, scale: 0.5, x: 100 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.5, ease: "backOut" }}
                >
                  <PlayerSlot
                    name={finalPlayers[1]}
                    isInput={false}
                    onSelect={() => advanceToBracket('final', finalPlayers[1])}
                    disabled={false}
                    buttonText="優勝"
                    animateEntry={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
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
