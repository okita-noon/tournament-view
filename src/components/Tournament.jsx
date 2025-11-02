import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import PlayerSlot from './PlayerSlot'
import { IMAGE_WIDTH, IMAGE_HEIGHT, SLOT_WIDTH, SLOT_HEIGHT, QF_WINNER_POSITIONS, SF_WINNER_POSITIONS, FINAL_PLAYER_POSITIONS } from '../tournamentConfig'
import './Tournament.css'

function Tournament({ players, playerPositions, champion, updatePlayer, advanceToBracket }) {
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

  // スロットの現在位置からラウンドを判定
  const getSlotRound = (slotIndex) => {
    const pos = playerPositions.find(p => p.slot === slotIndex)
    if (!pos) return 'initial'

    // QF Winner positions
    const qfPos = QF_WINNER_POSITIONS.find(qfp =>
      Math.abs(qfp.x - pos.x) < 10 && Math.abs(qfp.y - pos.y) < 10
    )
    if (qfPos) return 'qf-winner'

    // SF Winner positions
    const sfPos = SF_WINNER_POSITIONS.find(sfp =>
      Math.abs(sfp.x - pos.x) < 10 && Math.abs(sfp.y - pos.y) < 10
    )
    if (sfPos) return 'sf-winner'

    // Final positions
    const finalPos = FINAL_PLAYER_POSITIONS.find(fp =>
      Math.abs(fp.x - pos.x) < 10 && Math.abs(fp.y - pos.y) < 10
    )
    if (finalPos) return 'final'

    return 'initial'
  }

  // Determine match ID based on current position
  const getMatchInfo = (slotIndex) => {
    const round = getSlotRound(slotIndex)
    const pos = playerPositions.find(p => p.slot === slotIndex)

    if (round === 'initial') {
      const matchMap = {
        1: { matchId: 'qf0', opponentSlot: 2 },
        2: { matchId: 'qf0', opponentSlot: 1 },
        3: { matchId: 'qf1', opponentSlot: 4 },
        4: { matchId: 'qf1', opponentSlot: 3 },
        7: { matchId: 'qf2', opponentSlot: 8 },
        8: { matchId: 'qf2', opponentSlot: 7 },
        9: { matchId: 'qf3', opponentSlot: 10 },
        10: { matchId: 'qf3', opponentSlot: 9 },
        0: { matchId: 'sf0', opponentSlot: -1 },
        5: { matchId: 'sf1', opponentSlot: -1 },
        6: { matchId: 'sf2', opponentSlot: -1 },
        11: { matchId: 'sf3', opponentSlot: -1 },
      }
      return matchMap[slotIndex]
    } else if (round === 'sf-winner') {
      // SF Winner同士の準決勝
      const sfIndex = SF_WINNER_POSITIONS.findIndex(sfp =>
        Math.abs(sfp.x - pos.x) < 10 && Math.abs(sfp.y - pos.y) < 10
      )
      if (sfIndex === 0 || sfIndex === 1) {
        return { matchId: 'semi0', opponentSlot: -1 }
      } else {
        return { matchId: 'semi1', opponentSlot: -1 }
      }
    } else if (round === 'final') {
      return { matchId: 'final', opponentSlot: -1 }
    }

    return {}
  }

  const canAdvanceToBracket = (slotIndex) => {
    const round = getSlotRound(slotIndex)

    if (round === 'initial') {
      // Initial position - can always advance
      return true
    } else if (round === 'sf-winner' || round === 'final') {
      // SF winners or finalists - can always advance
      return true
    }

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
        {/* Render all 12 slots with animated positions */}
        {playerPositions.map((pos) => {
          // offsetXは初期位置の時だけ適用
          const round = getSlotRound(pos.slot)
          const isLeftColumn = pos.slot <= 5
          const offsetX = (round === 'initial' && isLeftColumn) ? 80 : 0
          const slotWidth = SLOT_WIDTH - 80

          return (
            <motion.div
              key={pos.slot}
              animate={{
                left: `${pos.x + offsetX}px`,
                top: `${pos.y}px`
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{
                position: 'absolute',
                width: `${slotWidth}px`,
                height: `${SLOT_HEIGHT}px`
              }}
            >
              <PlayerSlot
                name={players[pos.slot]}
                placeholder={`出場者 ${pos.slot + 1}`}
                isInput={false}
                onSelect={() => {
                  const { matchId } = getMatchInfo(pos.slot)
                  advanceToBracket(matchId, pos.slot)
                }}
                disabled={!canAdvanceToBracket(pos.slot)}
                buttonText="勝"
                animateEntry={false}
              />
            </motion.div>
          )
        })}

        {/* Champion display - positioned at center */}
        <div className="final-section">

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
