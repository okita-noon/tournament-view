import { useState, useEffect } from 'react'
import Tournament from './components/Tournament'
import { SLOT_POSITIONS, DEFAULT_PLAYERS, QF_WINNER_POSITIONS, SF_WINNER_POSITIONS, FINAL_PLAYER_POSITIONS, CHAMPION_POSITION, SLOT_WIDTH, SLOT_HEIGHT } from './tournamentConfig'
import './App.css'

function App() {
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('tournamentPlayers')
    return saved ? JSON.parse(saved) : DEFAULT_PLAYERS
  })

  // 各スロットの現在位置を管理
  const [playerPositions, setPlayerPositions] = useState(() => {
    const saved = localStorage.getItem('playerPositions')
    if (saved) return JSON.parse(saved)
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

  // 履歴管理（最大50ステップ）
  const [history, setHistory] = useState([])

  // 開発用: tournamentConfig.jsの変更を自動検知してリセット
  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.accept('./tournamentConfig.js', async (newModule) => {
        console.log('tournamentConfig.js が更新されました - 位置を再読み込み')
        if (newModule) {
          setPlayerPositions(newModule.SLOT_POSITIONS.map(p => ({ slot: p.slot, x: p.x, y: p.y })))
        } else {
          // フォールバック: ページリロード
          window.location.reload()
        }
      })
    }
  }, [])

  // 開発用: キーボードショートカット (Ctrl/Cmd + Shift + R) で位置をリセット
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+Shift+R または Cmd+Shift+R
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault()
        console.log('位置をリセット: tournamentConfig.jsから再読み込み')
        setPlayerPositions(SLOT_POSITIONS.map(p => ({ slot: p.slot, x: p.x, y: p.y })))
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    localStorage.setItem('tournamentPlayers', JSON.stringify(players))
  }, [players])

  useEffect(() => {
    localStorage.setItem('playerPositions', JSON.stringify(playerPositions))
  }, [playerPositions])

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
      'final': CHAMPION_POSITION
    }
    return positionMap[matchId]
  }

  const advanceToBracket = (matchId, winnerSlot, loserSlot = null) => {
    // 現在の状態を履歴に保存
    setHistory(prev => {
      const newHistory = [...prev, {
        players: [...players],
        playerPositions: playerPositions.map(p => ({ ...p })),
        champion,
        matchResults: { ...matchResults }
      }]
      // 最大50ステップまで保持
      return newHistory.slice(-50)
    })

    // 試合結果を記録
    if (loserSlot !== null) {
      setMatchResults(prev => ({
        ...prev,
        [matchId]: { winner: winnerSlot, loser: loserSlot }
      }))
    }

    // 次の位置を取得（中心座標）
    const nextPos = getNextPosition(matchId)

    // 中心座標を左上座標に変換
    const leftTopX = nextPos.x - (SLOT_WIDTH / 2)
    const leftTopY = nextPos.y - (SLOT_HEIGHT / 2)

    if (matchId === 'final') {
      // 優勝者を設定
      setChampion(players[winnerSlot])
      // 優勝者の位置を中央に移動
      setPlayerPositions(prev =>
        prev.map(p =>
          p.slot === winnerSlot ? { ...p, x: leftTopX, y: leftTopY } : p
        )
      )
    } else {
      // 勝者のスロットを次の位置に移動
      setPlayerPositions(prev =>
        prev.map(p =>
          p.slot === winnerSlot ? { ...p, x: leftTopX, y: leftTopY } : p
        )
      )
    }
  }

  const undo = () => {
    if (history.length === 0) return

    const previousState = history[history.length - 1]
    setPlayers(previousState.players)
    setPlayerPositions(previousState.playerPositions)
    setChampion(previousState.champion)
    setMatchResults(previousState.matchResults)

    // 履歴から最後のエントリを削除
    setHistory(prev => prev.slice(0, -1))
  }

  const reset = () => {
    setPlayers(DEFAULT_PLAYERS)
    setPlayerPositions(SLOT_POSITIONS.map(p => ({ slot: p.slot, x: p.x, y: p.y })))
    setChampion(null)
    setMatchResults({})
    setHistory([])
    localStorage.removeItem('tournamentPlayers')
    localStorage.removeItem('playerPositions')
    localStorage.removeItem('champion')
    localStorage.removeItem('matchResults')
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

      <button
        className="undo-btn"
        onClick={undo}
        title="元に戻す"
        disabled={history.length === 0}
      >
        ←
      </button>
      <button className="reset-btn" onClick={reset} title="リセット">
        ↻
      </button>
    </div>
  )
}

export default App
