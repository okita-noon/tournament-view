import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import PlayerSlot from './PlayerSlot'
import { IMAGE_WIDTH, IMAGE_HEIGHT, SLOT_WIDTH, SLOT_HEIGHT, QF_WINNER_POSITIONS, SF_WINNER_POSITIONS, FINAL_PLAYER_POSITIONS, TROPHY_IMAGE } from '../tournamentConfig'
import './Tournament.css'

function Tournament({ players, playerPositions, champion, matchResults, updatePlayer, advanceToBracket }) {
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

  // 対戦相手を取得する関数
  const getOpponent = (slotIndex) => {
    const round = getSlotRound(slotIndex)
    const pos = playerPositions.find(p => p.slot === slotIndex)

    if (round === 'initial') {
      const matchInfo = getMatchInfo(slotIndex)
      if (matchInfo && matchInfo.opponentSlot >= 0) {
        // QFの場合は固定の対戦相手
        return matchInfo.opponentSlot
      }

      // シード選手の場合、対応するQF勝者位置にいるプレイヤーを探す
      const seedToQfMap = { 0: 0, 5: 1, 6: 2, 11: 3 }
      const qfIndex = seedToQfMap[slotIndex]
      if (qfIndex !== undefined) {
        const qfPos = QF_WINNER_POSITIONS[qfIndex]
        const opponentAtQfPos = playerPositions.find(p =>
          Math.abs(p.x - qfPos.x) < 10 && Math.abs(p.y - qfPos.y) < 10
        )
        return opponentAtQfPos ? opponentAtQfPos.slot : null
      }
    } else if (round === 'qf-winner') {
      // QF勝者位置にいる場合、対応するシードと対戦
      const qfIndex = QF_WINNER_POSITIONS.findIndex(qfp =>
        Math.abs(qfp.x - pos.x) < 10 && Math.abs(qfp.y - pos.y) < 10
      )
      const qfToSeedMap = { 0: 0, 1: 5, 2: 6, 3: 11 }
      return qfToSeedMap[qfIndex]
    } else if (round === 'sf-winner') {
      // SF勝者位置にいる場合、対応する位置にいる別のSF勝者と対戦
      const sfIndex = SF_WINNER_POSITIONS.findIndex(sfp =>
        Math.abs(sfp.x - pos.x) < 10 && Math.abs(sfp.y - pos.y) < 10
      )

      // Semi0: SF0勝者(index 0) vs SF1勝者(index 1)
      // Semi1: SF2勝者(index 2) vs SF3勝者(index 3)
      let opponentSfIndex
      if (sfIndex === 0) opponentSfIndex = 1
      else if (sfIndex === 1) opponentSfIndex = 0
      else if (sfIndex === 2) opponentSfIndex = 3
      else if (sfIndex === 3) opponentSfIndex = 2

      if (opponentSfIndex !== undefined) {
        const opponentSfPos = SF_WINNER_POSITIONS[opponentSfIndex]
        const opponentAtSfPos = playerPositions.find(p =>
          Math.abs(p.x - opponentSfPos.x) < 10 && Math.abs(p.y - opponentSfPos.y) < 10
        )
        return opponentAtSfPos ? opponentAtSfPos.slot : null
      }
    } else if (round === 'final') {
      // 決勝位置にいる場合、もう一方の決勝位置にいるプレイヤーと対戦
      const finalIndex = FINAL_PLAYER_POSITIONS.findIndex(fp =>
        Math.abs(fp.x - pos.x) < 10 && Math.abs(fp.y - pos.y) < 10
      )
      const opponentFinalIndex = finalIndex === 0 ? 1 : 0
      const opponentFinalPos = FINAL_PLAYER_POSITIONS[opponentFinalIndex]
      const opponentAtFinalPos = playerPositions.find(p =>
        Math.abs(p.x - opponentFinalPos.x) < 10 && Math.abs(p.y - opponentFinalPos.y) < 10
      )
      return opponentAtFinalPos ? opponentAtFinalPos.slot : null
    }

    return null
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
    } else if (round === 'qf-winner') {
      // QF勝者がシード選手と対戦
      const qfIndex = QF_WINNER_POSITIONS.findIndex(qfp =>
        Math.abs(qfp.x - pos.x) < 10 && Math.abs(qfp.y - pos.y) < 10
      )
      if (qfIndex >= 0) {
        return { matchId: `sf${qfIndex}`, opponentSlot: -1 }
      }
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

    // 対戦相手がいない場合は進めない
    const opponent = getOpponent(slotIndex)

    if (round === 'initial') {
      // Initial position - 対戦相手がいる場合のみ進める
      const matchInfo = getMatchInfo(slotIndex)
      if (matchInfo && matchInfo.opponentSlot >= 0) {
        // QFの固定ペアは常に進める
        return true
      }
      // シードの場合は対戦相手（QF勝者）がいる場合のみ
      return opponent !== null
    } else if (round === 'qf-winner' || round === 'sf-winner' || round === 'final') {
      // QF winners, SF winners or finalists - 対戦相手がいる場合のみ進める
      return opponent !== null
    }

    return false
  }

  // 古いisLoser関数（位置ベース）- 今は使用しない
  const isLoserOld = (slotIndex) => {
    const round = getSlotRound(slotIndex)

    if (round === 'initial') {
      const matchInfo = getMatchInfo(slotIndex)
      if (!matchInfo || !matchInfo.matchId) return false

      // Round 1 (QF): 対戦相手が移動したら負け
      if (matchInfo.matchId.startsWith('qf')) {
        const opponentSlot = matchInfo.opponentSlot
        if (opponentSlot >= 0) {
          const opponentRound = getSlotRound(opponentSlot)
          return opponentRound !== 'initial'
        }
      }

      // Round 2 (SF): シード選手の場合、対応するQF勝者位置に誰かいるかチェック
      if (matchInfo.matchId.startsWith('sf')) {
        const sfIndex = { 'sf0': 0, 'sf1': 1, 'sf2': 2, 'sf3': 3 }[matchInfo.matchId]
        // QF勝者位置に誰かいるかチェック
        const qfWinnerAtPosition = playerPositions.some(p => {
          const posRound = getSlotRound(p.slot)
          if (posRound !== 'qf-winner') return false
          const qfPos = QF_WINNER_POSITIONS[sfIndex]
          return Math.abs(p.x - qfPos.x) < 10 && Math.abs(p.y - qfPos.y) < 10
        })

        if (qfWinnerAtPosition) {
          // QF勝者がいる場合、その人がさらに進んでいたら負け
          const qfWinnerSlot = playerPositions.find(p => {
            const posRound = getSlotRound(p.slot)
            if (posRound !== 'qf-winner') return false
            const qfPos = QF_WINNER_POSITIONS[sfIndex]
            return Math.abs(p.x - qfPos.x) < 10 && Math.abs(p.y - qfPos.y) < 10
          })
          if (qfWinnerSlot) {
            const qfWinnerNextRound = getSlotRound(qfWinnerSlot.slot)
            return qfWinnerNextRound === 'sf-winner'
          }
        }
      }
    } else if (round === 'qf-winner') {
      // QF勝者位置にいる場合、SF勝者位置に誰か移動していたら負け
      const pos = playerPositions.find(p => p.slot === slotIndex)
      const qfIndex = QF_WINNER_POSITIONS.findIndex(qfp =>
        Math.abs(qfp.x - pos.x) < 10 && Math.abs(qfp.y - pos.y) < 10
      )

      if (qfIndex >= 0) {
        // 対応するSF位置をチェック
        const sfPos = SF_WINNER_POSITIONS[qfIndex]
        const someoneAdvanced = playerPositions.some(p => {
          return Math.abs(p.x - sfPos.x) < 10 && Math.abs(p.y - sfPos.y) < 10
        })
        return someoneAdvanced
      }
    } else if (round === 'sf-winner') {
      // SF勝者位置にいる場合、決勝位置に誰か移動していたら負け
      const pos = playerPositions.find(p => p.slot === slotIndex)
      const sfIndex = SF_WINNER_POSITIONS.findIndex(sfp =>
        Math.abs(sfp.x - pos.x) < 10 && Math.abs(sfp.y - pos.y) < 10
      )

      if (sfIndex >= 0) {
        const finalPosIndex = sfIndex < 2 ? 0 : 1
        const finalPos = FINAL_PLAYER_POSITIONS[finalPosIndex]
        const someoneAdvanced = playerPositions.some(p => {
          return Math.abs(p.x - finalPos.x) < 10 && Math.abs(p.y - finalPos.y) < 10
        })
        return someoneAdvanced
      }
    } else if (round === 'final') {
      // 決勝で優勝者が決まっていたら負け
      return champion && players[slotIndex] !== champion
    }

    return false
  }

  // シンプルなisLoser関数（試合結果ベース）
  const isLoser = (slotIndex) => {
    // matchResultsから、このスロットが敗者として記録されているかチェック
    return Object.values(matchResults).some(result => result.loser === slotIndex)
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
                isLoser={isLoser(pos.slot)}
                onSelect={() => {
                  const { matchId } = getMatchInfo(pos.slot)
                  const loserSlot = getOpponent(pos.slot)
                  advanceToBracket(matchId, pos.slot, loserSlot)
                }}
                disabled={!canAdvanceToBracket(pos.slot)}
                buttonText="勝"
                animateEntry={false}
              />
            </motion.div>
          )
        })}

      </div>
    </div>
  )
}

export default Tournament
