import { useState, useEffect } from 'react'
import Tournament from './components/Tournament'
import { SLOT_POSITIONS, DEFAULT_PLAYERS, QF_WINNER_POSITIONS, SF_WINNER_POSITIONS, FINAL_PLAYER_POSITIONS } from './tournamentConfig'
import './App.css'

function App() {
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('tournamentPlayers')
    return saved ? JSON.parse(saved) : DEFAULT_PLAYERS
  })

  // 各スロットの現在位置を管理
  const [playerPositions, setPlayerPositions] = useState(() => {
    // const saved = localStorage.getItem('playerPositions')
    // if (saved) return JSON.parse(saved)
    return SLOT_POSITIONS.map(p => ({ slot: p.slot, x: p.x, y: p.y }))
  })

  const [champion, setChampion] = useState(() => {
    return localStorage.getItem('champion') || null
  })

  // 試合結果の記録
  const [matchResults, setMatchResults] = useState(() => {
    const saved = localStorage.getItem('matchResults')
    return saved ? JSON.parse(saved) : {}
  })

  useEffect(() => {
    localStorage.setItem('tournamentPlayers', JSON.stringify(players))
  }, [players])

  // useEffect(() => {
  //   localStorage.setItem('playerPositions', JSON.stringify(playerPositions))
  // }, [playerPositions])

  useEffect(() => {
    if (champion) {
      localStorage.setItem('champion', champion)
    } else {
      localStorage.removeItem('champion')
    }
  }, [champion])

  useEffect(() => {
    localStorage.setItem('matchResults', JSON.stringify(matchResults))
  }, [matchResults])

  const updatePlayer = (slotIndex, name) => {
    setPlayers(prev => {
      const newPlayers = [...prev]
      newPlayers[slotIndex] = name
      return newPlayers
    })
  }

  const getNextPosition = (matchId) => {
    const positionMap = {
      'qf0': QF_WINNER_POSITIONS[0],
      'qf1': QF_WINNER_POSITIONS[1],
      'qf2': QF_WINNER_POSITIONS[2],
      'qf3': QF_WINNER_POSITIONS[3],
      'sf0': SF_WINNER_POSITIONS[0],
      'sf1': SF_WINNER_POSITIONS[1],
      'sf2': SF_WINNER_POSITIONS[2],
      'sf3': SF_WINNER_POSITIONS[3],
      'semi0': FINAL_PLAYER_POSITIONS[0],
      'semi1': FINAL_PLAYER_POSITIONS[1],
      'final': { x: 22.135, y: 19.444 } // Champion position (center) (in percentage)
    }
    return positionMap[matchId]
  }

  const advanceToBracket = (matchId, winnerSlot, loserSlot = null) => {
    // 試合結果を記録
    if (loserSlot !== null) {
      setMatchResults(prev => ({
        ...prev,
        [matchId]: { winner: winnerSlot, loser: loserSlot }
      }))
    }

    if (matchId === 'final') {
      // 優勝者を設定
      setChampion(players[winnerSlot])
      // 優勝者の位置を中央に移動
      const nextPos = getNextPosition(matchId)
      setPlayerPositions(prev =>
        prev.map(p =>
          p.slot === winnerSlot ? { ...p, x: nextPos.x, y: nextPos.y } : p
        )
      )
    } else {
      // 勝者のスロットを次の位置に移動
      const nextPos = getNextPosition(matchId)
      setPlayerPositions(prev =>
        prev.map(p =>
          p.slot === winnerSlot ? { ...p, x: nextPos.x, y: nextPos.y } : p
        )
      )
    }
  }

  const reset = () => {
    if (confirm('トーナメントをリセットしますか？')) {
      setPlayers(DEFAULT_PLAYERS)
      setPlayerPositions(SLOT_POSITIONS.map(p => ({ slot: p.slot, x: p.x, y: p.y })))
      setChampion(null)
      setMatchResults({})
      localStorage.removeItem('tournamentPlayers')
      localStorage.removeItem('playerPositions')
      localStorage.removeItem('champion')
      localStorage.removeItem('matchResults')
    }
  }

  return (
    <div className="app">
      <Tournament
        players={players}
        playerPositions={playerPositions}
        champion={champion}
        matchResults={matchResults}
        updatePlayer={updatePlayer}
        advanceToBracket={advanceToBracket}
      />

      <div className="controls">
        <button className="reset-btn" onClick={reset}>
          リセット
        </button>
      </div>
    </div>
  )
}

export default App
