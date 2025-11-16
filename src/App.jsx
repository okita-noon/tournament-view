import { useState, useEffect } from 'react'
import Tournament from './components/Tournament'
import HelpModal from './components/HelpModal'
import { SLOT_POSITIONS, DEFAULT_PLAYERS, QF_WINNER_POSITIONS, SF_WINNER_POSITIONS, FINAL_PLAYER_POSITIONS, CHAMPION_POSITION, SLOT_WIDTH, SLOT_HEIGHT, AVAILABLE_PLAYERS } from './tournamentConfig'
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

  // モード管理（入力モード vs 対戦モード）
  const [isBattleMode, setIsBattleMode] = useState(() => {
    const saved = localStorage.getItem('isBattleMode')
    return saved ? JSON.parse(saved) : false
  })

  // 縮尺管理
  const [scale, setScale] = useState(() => {
    const saved = localStorage.getItem('viewScale')
    return saved ? parseFloat(saved) : 1.0
  })

  // 位置オフセット管理（%単位）
  const [offsetY, setOffsetY] = useState(() => {
    const saved = localStorage.getItem('viewOffsetY')
    return saved ? parseFloat(saved) : 0
  })
  const [offsetX, setOffsetX] = useState(() => {
    const saved = localStorage.getItem('viewOffsetX')
    return saved ? parseFloat(saved) : 0
  })

  // コントロール表示トグル
  const [showControls, setShowControls] = useState(false)

  // ヘルプモーダル表示
  const [showHelp, setShowHelp] = useState(false)

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

  useEffect(() => {
    localStorage.setItem('viewScale', scale.toString())
  }, [scale])

  useEffect(() => {
    localStorage.setItem('viewOffsetX', offsetX.toString())
  }, [offsetX])

  useEffect(() => {
    localStorage.setItem('viewOffsetY', offsetY.toString())
  }, [offsetY])

  useEffect(() => {
    localStorage.setItem('isBattleMode', JSON.stringify(isBattleMode))
  }, [isBattleMode])

  // 全員セットされたら自動的に対戦モードへ移行
  useEffect(() => {
    if (!isBattleMode) {
      const allFilled = players.every(p => p.trim() !== '')
      if (allFilled) {
        setIsBattleMode(true)
      }
    }
  }, [players, isBattleMode])

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
    if (!window.confirm('全ての選手設定と対戦結果をリセットしますか？\n（表示設定は保持されます）')) {
      return
    }

    setPlayers(DEFAULT_PLAYERS)
    setPlayerPositions(SLOT_POSITIONS.map(p => ({ slot: p.slot, x: p.x, y: p.y })))
    setChampion(null)
    setMatchResults({})
    setHistory([])
    setIsBattleMode(false)
    localStorage.removeItem('tournamentPlayers')
    localStorage.removeItem('playerPositions')
    localStorage.removeItem('champion')
    localStorage.removeItem('matchResults')
    localStorage.removeItem('isBattleMode')
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev * 1.1, 2.0))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev / 1.1, 0.5))
  }

  const moveUp = () => {
    setOffsetY(prev => prev - 5)
  }

  const moveDown = () => {
    setOffsetY(prev => prev + 5)
  }

  const moveLeft = () => {
    setOffsetX(prev => prev - 5)
  }

  const moveRight = () => {
    setOffsetX(prev => prev + 5)
  }

  const resetView = () => {
    setOffsetX(0)
    setOffsetY(0)
    setScale(1.0)
    localStorage.removeItem('viewScale')
    localStorage.removeItem('viewOffsetX')
    localStorage.removeItem('viewOffsetY')
  }

  const randomizePlayers = () => {
    // Fisher-Yatesシャッフルでランダムに12人選択
    const shuffled = [...AVAILABLE_PLAYERS].sort(() => Math.random() - 0.5)
    const randomPlayers = shuffled.slice(0, 12)
    setPlayers(randomPlayers)
  }

  return (
    <div className="app">
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <Tournament
        players={players}
        playerPositions={playerPositions}
        champion={champion}
        matchResults={matchResults}
        updatePlayer={updatePlayer}
        advanceToBracket={advanceToBracket}
        isBattleMode={isBattleMode}
        scale={scale}
        offsetX={offsetX}
        offsetY={offsetY}
      />

      {/* コントロール表示トグルボタン */}
      <button
        className="toggle-controls-btn"
        onClick={() => setShowControls(!showControls)}
      >
        {showControls ? "×" : "⚙"}
      </button>

      {showControls && (
        <>
          {/* 移動ボタン（左側） */}
          <button className="move-up-btn" onClick={moveUp} data-tooltip="上に移動">
            ↑
          </button>
          <button className="move-down-btn" onClick={moveDown} data-tooltip="下に移動">
            ↓
          </button>
          <button className="move-left-btn tooltip-right" onClick={moveLeft} data-tooltip="左に移動">
            ←
          </button>
          <button className="move-right-btn" onClick={moveRight} data-tooltip="右に移動">
            →
          </button>
          <button className="reset-view-btn" onClick={resetView} data-tooltip="中央に戻す">
            ●
          </button>

          {/* ズームボタン（右側） */}
          <button
            className="zoom-in-btn"
            onClick={zoomIn}
            data-tooltip="拡大"
            disabled={scale >= 2.0}
          >
            +
          </button>
          <button
            className="zoom-out-btn tooltip-right"
            onClick={zoomOut}
            data-tooltip="縮小"
            disabled={scale <= 0.5}
          >
            −
          </button>

          {/* ランダム設定ボタン */}
          <button
            className="random-players-btn tooltip-right"
            onClick={randomizePlayers}
            data-tooltip="ランダムに設定"
          >
            🎲
          </button>

          {/* ヘルプボタン */}
          <button
            className="help-btn"
            onClick={() => setShowHelp(true)}
            data-tooltip="使い方"
          >
            ?
          </button>
        </>
      )}

      {/* その他のボタン（右下） */}
      {isBattleMode && (
        <button
          className="undo-btn"
          onClick={undo}
          data-tooltip="元に戻す"
          disabled={history.length === 0}
        >
          ⟲
        </button>
      )}
      <button className="reset-btn" onClick={reset}>
        ↻
      </button>
    </div>
  )
}

export default App
