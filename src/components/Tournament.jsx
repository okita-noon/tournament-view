import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import PlayerSlot from './PlayerSlot'
import {
  IMAGE_WIDTH,
  IMAGE_HEIGHT,
  SLOT_WIDTH,
  SLOT_HEIGHT,
  SLOT_POSITIONS,
  QF_WINNER_POSITIONS,
  SF_WINNER_POSITIONS,
  FINAL_PLAYER_POSITIONS,
  TROPHY_IMAGE,
  PLAYER_SLOT_IMAGES,
  MATCH_PATHS,
  DEBUG_COORDINATE_PICKER,
} from '../tournamentConfig'
import './Tournament.css'

function Tournament({
  players,
  playerPositions,
  champion,
  matchResults,
  updatePlayer,
  advanceToBracket,
}) {
  const [clickedCoord, setClickedCoord] = useState(null)

  // スロットの現在位置からラウンドを判定
  const getSlotRound = (slotIndex) => {
    const pos = playerPositions.find((p) => p.slot === slotIndex)
    if (!pos) return 'initial'

    // pos.x, pos.yは左上座標なので、中心座標に変換して比較
    const centerX = pos.x + SLOT_WIDTH / 2
    const centerY = pos.y + SLOT_HEIGHT / 2

    // QF Winner positions
    const qfPos = QF_WINNER_POSITIONS.find(
      (qfp) => Math.abs(qfp.x - centerX) < 1 && Math.abs(qfp.y - centerY) < 1,
    )
    if (qfPos) return 'qf-winner'

    // SF Winner positions
    const sfPos = SF_WINNER_POSITIONS.find(
      (sfp) => Math.abs(sfp.x - centerX) < 1 && Math.abs(sfp.y - centerY) < 1,
    )
    if (sfPos) return 'sf-winner'

    // Final positions
    const finalPos = FINAL_PLAYER_POSITIONS.find(
      (fp) => Math.abs(fp.x - centerX) < 1 && Math.abs(fp.y - centerY) < 1,
    )
    if (finalPos) return 'final'

    return 'initial'
  }

  // 対戦相手を取得する関数
  const getOpponent = (slotIndex) => {
    const round = getSlotRound(slotIndex)
    const pos = playerPositions.find((p) => p.slot === slotIndex)

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
        // qfPosは中心座標、pは左上座標なので変換して比較
        const opponentAtQfPos = playerPositions.find((p) => {
          const pCenterX = p.x + SLOT_WIDTH / 2
          const pCenterY = p.y + SLOT_HEIGHT / 2
          return (
            Math.abs(pCenterX - qfPos.x) < 1 && Math.abs(pCenterY - qfPos.y) < 1
          )
        })
        return opponentAtQfPos ? opponentAtQfPos.slot : null
      }
    } else if (round === 'qf-winner') {
      // QF勝者位置にいる場合、対応するシードと対戦
      const centerX = pos.x + SLOT_WIDTH / 2
      const centerY = pos.y + SLOT_HEIGHT / 2
      const qfIndex = QF_WINNER_POSITIONS.findIndex(
        (qfp) => Math.abs(qfp.x - centerX) < 1 && Math.abs(qfp.y - centerY) < 1,
      )
      const qfToSeedMap = { 0: 0, 1: 5, 2: 6, 3: 11 }
      return qfToSeedMap[qfIndex]
    } else if (round === 'sf-winner') {
      // SF勝者位置にいる場合、対応する位置にいる別のSF勝者と対戦
      const centerX = pos.x + SLOT_WIDTH / 2
      const centerY = pos.y + SLOT_HEIGHT / 2
      const sfIndex = SF_WINNER_POSITIONS.findIndex(
        (sfp) => Math.abs(sfp.x - centerX) < 1 && Math.abs(sfp.y - centerY) < 1,
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
        const opponentAtSfPos = playerPositions.find((p) => {
          const pCenterX = p.x + SLOT_WIDTH / 2
          const pCenterY = p.y + SLOT_HEIGHT / 2
          return (
            Math.abs(pCenterX - opponentSfPos.x) < 1 &&
            Math.abs(pCenterY - opponentSfPos.y) < 1
          )
        })
        return opponentAtSfPos ? opponentAtSfPos.slot : null
      }
    } else if (round === 'final') {
      // 決勝位置にいる場合、もう一方の決勝位置にいるプレイヤーと対戦
      const centerX = pos.x + SLOT_WIDTH / 2
      const centerY = pos.y + SLOT_HEIGHT / 2
      const finalIndex = FINAL_PLAYER_POSITIONS.findIndex(
        (fp) => Math.abs(fp.x - centerX) < 1 && Math.abs(fp.y - centerY) < 1,
      )
      const opponentFinalIndex = finalIndex === 0 ? 1 : 0
      const opponentFinalPos = FINAL_PLAYER_POSITIONS[opponentFinalIndex]
      const opponentAtFinalPos = playerPositions.find((p) => {
        const pCenterX = p.x + SLOT_WIDTH / 2
        const pCenterY = p.y + SLOT_HEIGHT / 2
        return (
          Math.abs(pCenterX - opponentFinalPos.x) < 1 &&
          Math.abs(pCenterY - opponentFinalPos.y) < 1
        )
      })
      return opponentAtFinalPos ? opponentAtFinalPos.slot : null
    }

    return null
  }

  // Determine match ID based on current position
  const getMatchInfo = (slotIndex) => {
    const round = getSlotRound(slotIndex)
    const pos = playerPositions.find((p) => p.slot === slotIndex)

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
      const centerX = pos.x + SLOT_WIDTH / 2
      const centerY = pos.y + SLOT_HEIGHT / 2
      const qfIndex = QF_WINNER_POSITIONS.findIndex(
        (qfp) => Math.abs(qfp.x - centerX) < 1 && Math.abs(qfp.y - centerY) < 1,
      )
      if (qfIndex >= 0) {
        return { matchId: `sf${qfIndex}`, opponentSlot: -1 }
      }
    } else if (round === 'sf-winner') {
      // SF Winner同士の準決勝
      const centerX = pos.x + SLOT_WIDTH / 2
      const centerY = pos.y + SLOT_HEIGHT / 2
      const sfIndex = SF_WINNER_POSITIONS.findIndex(
        (sfp) => Math.abs(sfp.x - centerX) < 1 && Math.abs(sfp.y - centerY) < 1,
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
    } else if (
      round === 'qf-winner' ||
      round === 'sf-winner' ||
      round === 'final'
    ) {
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
        const sfIndex = { sf0: 0, sf1: 1, sf2: 2, sf3: 3 }[matchInfo.matchId]
        // QF勝者位置に誰かいるかチェック
        const qfWinnerAtPosition = playerPositions.some((p) => {
          const posRound = getSlotRound(p.slot)
          if (posRound !== 'qf-winner') return false
          const qfPos = QF_WINNER_POSITIONS[sfIndex]
          return Math.abs(p.x - qfPos.x) < 10 && Math.abs(p.y - qfPos.y) < 10
        })

        if (qfWinnerAtPosition) {
          // QF勝者がいる場合、その人がさらに進んでいたら負け
          const qfWinnerSlot = playerPositions.find((p) => {
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
      const pos = playerPositions.find((p) => p.slot === slotIndex)
      const qfIndex = QF_WINNER_POSITIONS.findIndex(
        (qfp) => Math.abs(qfp.x - pos.x) < 10 && Math.abs(qfp.y - pos.y) < 10,
      )

      if (qfIndex >= 0) {
        // 対応するSF位置をチェック
        const sfPos = SF_WINNER_POSITIONS[qfIndex]
        const someoneAdvanced = playerPositions.some((p) => {
          return Math.abs(p.x - sfPos.x) < 10 && Math.abs(p.y - sfPos.y) < 10
        })
        return someoneAdvanced
      }
    } else if (round === 'sf-winner') {
      // SF勝者位置にいる場合、決勝位置に誰か移動していたら負け
      const pos = playerPositions.find((p) => p.slot === slotIndex)
      const sfIndex = SF_WINNER_POSITIONS.findIndex(
        (sfp) => Math.abs(sfp.x - pos.x) < 10 && Math.abs(sfp.y - pos.y) < 10,
      )

      if (sfIndex >= 0) {
        const finalPosIndex = sfIndex < 2 ? 0 : 1
        const finalPos = FINAL_PLAYER_POSITIONS[finalPosIndex]
        const someoneAdvanced = playerPositions.some((p) => {
          return (
            Math.abs(p.x - finalPos.x) < 10 && Math.abs(p.y - finalPos.y) < 10
          )
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
    return Object.values(matchResults).some(
      (result) => result.loser === slotIndex,
    )
  }

  // matchIdから次の位置を取得
  const getNextPositionFromMatch = (matchId) => {
    const positionMap = {
      qf0: QF_WINNER_POSITIONS[0],
      qf1: QF_WINNER_POSITIONS[1],
      qf2: QF_WINNER_POSITIONS[2],
      qf3: QF_WINNER_POSITIONS[3],
      sf0: SF_WINNER_POSITIONS[0],
      sf1: SF_WINNER_POSITIONS[1],
      sf2: SF_WINNER_POSITIONS[2],
      sf3: SF_WINNER_POSITIONS[3],
      semi0: FINAL_PLAYER_POSITIONS[0],
      semi1: FINAL_PLAYER_POSITIONS[1],
      final: { x: 850, y: 420 },
    }
    return positionMap[matchId]
  }

  // 全ての勝者経路を取得
  const getAllWinnerPaths = () => {
    const paths = []

    Object.entries(matchResults).forEach(([matchId, result]) => {
      let pathKey = null

      // Quarter Finals
      if (matchId === 'qf0') pathKey = result.winner === 1 ? 'qf0_slot1' : 'qf0_slot2'
      else if (matchId === 'qf1') pathKey = result.winner === 3 ? 'qf1_slot3' : 'qf1_slot4'
      else if (matchId === 'qf2') pathKey = result.winner === 7 ? 'qf2_slot7' : 'qf2_slot8'
      else if (matchId === 'qf3') pathKey = result.winner === 9 ? 'qf3_slot9' : 'qf3_slot10'

      // Semi Finals
      else if (matchId === 'sf0') pathKey = result.winner === 0 ? 'sf0_slot0' : 'sf0_qfWinner0'
      else if (matchId === 'sf1') pathKey = result.winner === 5 ? 'sf1_slot5' : 'sf1_qfWinner1'
      else if (matchId === 'sf2') pathKey = result.winner === 6 ? 'sf2_slot6' : 'sf2_qfWinner2'
      else if (matchId === 'sf3') pathKey = result.winner === 11 ? 'sf3_slot11' : 'sf3_qfWinner3'

      // Semi-semi finals (準決勝)
      else if (matchId === 'semi0') {
        // semi0 = SF0勝者 vs SF1勝者
        const isSfWinner0 = matchResults['sf0']?.winner === result.winner
        pathKey = isSfWinner0 ? 'semi0_sfWinner0' : 'semi0_sfWinner1'
      }
      else if (matchId === 'semi1') {
        // semi1 = SF2勝者 vs SF3勝者
        const isSfWinner2 = matchResults['sf2']?.winner === result.winner
        pathKey = isSfWinner2 ? 'semi1_sfWinner2' : 'semi1_sfWinner3'
      }

      // Finals
      else if (matchId === 'final') {
        // final = semi0勝者 vs semi1勝者
        const isSemi0Winner = matchResults['semi0']?.winner === result.winner
        pathKey = isSemi0Winner ? 'final_player0' : 'final_player1'
      }

      if (pathKey && MATCH_PATHS[pathKey]) {
        paths.push({
          key: `${matchId}-${result.winner}`,
          waypoints: MATCH_PATHS[pathKey],
        })
      }
    })

    return paths
  }

  // SVGパス文字列を生成（%ベースの経由点から）
  const createPathString = (waypoints) => {
    if (!waypoints || waypoints.length < 2) return ''

    // y座標をviewBoxのアスペクト比に合わせて変換 (100% -> 56.25%)
    const aspectRatio = IMAGE_HEIGHT / IMAGE_WIDTH // 0.5625
    const convertedWaypoints = waypoints.map((wp) => ({
      x: wp.x,
      y: wp.y * aspectRatio,
    }))

    // SVG path文字列を構築（viewBox座標系で0-100 x 0-56.25の範囲）
    let pathString = `M ${convertedWaypoints[0].x} ${convertedWaypoints[0].y}`

    for (let i = 1; i < convertedWaypoints.length; i++) {
      pathString += ` L ${convertedWaypoints[i].x} ${convertedWaypoints[i].y}`
    }

    return pathString
  }

  // デバッグ用: クリックで座標を取得
  const handleCoordinateClick = (e) => {
    if (!DEBUG_COORDINATE_PICKER) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // %に変換
    const xPercent = parseFloat(((x / rect.width) * 100).toFixed(3))
    const yPercent = parseFloat(((y / rect.height) * 100).toFixed(3))

    setClickedCoord({ x: xPercent, y: yPercent })
    console.log(`クリック座標: { x: ${xPercent}, y: ${yPercent} }`)
  }

  return (
    <div className='tournament-container'>
      {/* デバッグ用: 座標表示 */}
      {DEBUG_COORDINATE_PICKER && clickedCoord && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#0f0',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px',
            zIndex: 10000,
            border: '2px solid #0f0',
          }}
        >
          <div>クリック座標 (中心):</div>
          <div>x: {clickedCoord.x}%</div>
          <div>y: {clickedCoord.y}%</div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#aaa' }}>
            <div>左上座標:</div>
            <div>x: {(clickedCoord.x - SLOT_WIDTH / 2).toFixed(3)}%</div>
            <div>y: {(clickedCoord.y - SLOT_HEIGHT / 2).toFixed(3)}%</div>
          </div>
          <button
            onClick={() => setClickedCoord(null)}
            style={{
              marginTop: '10px',
              background: '#333',
              color: '#fff',
              border: '1px solid #0f0',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            閉じる
          </button>
        </div>
      )}

      <div
        className='tournament-bracket-absolute'
        onClick={handleCoordinateClick}
        style={{
          width: '100%',
          paddingTop: `${(IMAGE_HEIGHT / IMAGE_WIDTH) * 100}%`,
          position: 'relative',
          cursor: DEBUG_COORDINATE_PICKER ? 'crosshair' : 'default',
        }}
      >
        {/* SVG layer for winner paths */}
        <svg
          className='winner-paths-svg'
          viewBox='0 0 100 56.25'
          preserveAspectRatio='xMidYMid meet'
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {getAllWinnerPaths().map(({ key, waypoints }) => {
            const pathString = createPathString(waypoints)
            if (!pathString) return null

            return (
              <motion.path
                key={key}
                d={pathString}
                stroke='#ff0000'
                strokeWidth='0.8'
                fill='none'
                strokeLinecap='round'
                strokeLinejoin='miter'
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
            )
          })}
        </svg>

        {/* Render initial positions (always visible) */}
        {SLOT_POSITIONS.map((initialPos) => {
          return (
            <div
              key={`initial-${initialPos.slot}`}
              style={{
                position: 'absolute',
                left: `${initialPos.x}%`,
                top: `${initialPos.y}%`,
                width: `${SLOT_WIDTH}%`,
                height: `${SLOT_HEIGHT}%`,
                zIndex: 2,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              >
                <PlayerSlot
                  name={players[initialPos.slot]}
                  placeholder={`出場者 ${initialPos.slot + 1}`}
                  isInput={false}
                  isLoser={isLoser(initialPos.slot)}
                  onSelect={() => {}}
                  disabled={true}
                  buttonText='勝'
                  animateEntry={false}
                  slotImage={PLAYER_SLOT_IMAGES[initialPos.slot]}
                />
                {/* クリック可能な領域 (中央50%) */}
                <div
                  onClick={() => {
                    if (!canAdvanceToBracket(initialPos.slot) || isLoser(initialPos.slot))
                      return
                    const { matchId } = getMatchInfo(initialPos.slot)
                    const loserSlot = getOpponent(initialPos.slot)
                    advanceToBracket(matchId, initialPos.slot, loserSlot)
                  }}
                  style={{
                    position: 'absolute',
                    left: '25%',
                    top: '0',
                    width: '50%',
                    height: '100%',
                    pointerEvents: 'auto',
                    cursor:
                      !canAdvanceToBracket(initialPos.slot) || isLoser(initialPos.slot)
                        ? 'default'
                        : 'pointer',
                  }}
                />
              </div>
            </div>
          )
        })}

        {/* Render moved positions (animated) - 各スロットごとに常に存在 */}
        {SLOT_POSITIONS.map((initialPos) => {
          const pos = playerPositions.find(p => p.slot === initialPos.slot)
          if (!pos) return null

          // 初期位置と同じ場合は非表示
          const isAtInitialPosition = Math.abs(initialPos.x - pos.x) < 0.1 && Math.abs(initialPos.y - pos.y) < 0.1

          return (
            <motion.div
              key={`moved-${initialPos.slot}`}
              animate={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                opacity: isAtInitialPosition ? 0 : 1,
              }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                width: `${SLOT_WIDTH}%`,
                height: `${SLOT_HEIGHT}%`,
                zIndex: 2,
                pointerEvents: isAtInitialPosition ? 'none' : 'auto',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              >
                <PlayerSlot
                  name={players[initialPos.slot]}
                  placeholder={`出場者 ${initialPos.slot + 1}`}
                  isInput={false}
                  isLoser={isLoser(initialPos.slot)}
                  onSelect={() => {}}
                  disabled={true}
                  buttonText='勝'
                  animateEntry={false}
                  slotImage={PLAYER_SLOT_IMAGES[initialPos.slot]}
                />
                {/* クリック可能な領域 (中央50%) */}
                <div
                  onClick={() => {
                    if (!canAdvanceToBracket(initialPos.slot) || isLoser(initialPos.slot))
                      return
                    const { matchId } = getMatchInfo(initialPos.slot)
                    const loserSlot = getOpponent(initialPos.slot)
                    advanceToBracket(matchId, initialPos.slot, loserSlot)
                  }}
                  style={{
                    position: 'absolute',
                    left: '25%',
                    top: '0',
                    width: '50%',
                    height: '100%',
                    pointerEvents: 'auto',
                    cursor:
                      !canAdvanceToBracket(initialPos.slot) || isLoser(initialPos.slot)
                        ? 'default'
                        : 'pointer',
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default Tournament
