import { useState, useEffect } from 'react'
import Tournament from './components/Tournament'
import { SLOT_POSITIONS, DEFAULT_PLAYERS } from './tournamentConfig'
import './App.css'

function App() {
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('tournamentPlayers')
    return saved ? JSON.parse(saved) : DEFAULT_PLAYERS
  })

  // Round 1 winners (QF0-3 winners)
  const [qfWinners, setQfWinners] = useState(() => {
    const saved = localStorage.getItem('qfWinners')
    return saved ? JSON.parse(saved) : Array(4).fill('')
  })

  // Round 2 winners (SF0-3 winners: QF winner vs Seed)
  const [sfWinners, setSfWinners] = useState(() => {
    const saved = localStorage.getItem('sfWinners')
    return saved ? JSON.parse(saved) : Array(4).fill('')
  })

  // Semi-final winners (進出者2人)
  const [finalPlayers, setFinalPlayers] = useState(() => {
    const saved = localStorage.getItem('finalPlayers')
    return saved ? JSON.parse(saved) : ['', '']
  })

  const [champion, setChampion] = useState(() => {
    return localStorage.getItem('champion') || null
  })

  useEffect(() => {
    localStorage.setItem('tournamentPlayers', JSON.stringify(players))
  }, [players])

  useEffect(() => {
    localStorage.setItem('qfWinners', JSON.stringify(qfWinners))
  }, [qfWinners])

  useEffect(() => {
    localStorage.setItem('sfWinners', JSON.stringify(sfWinners))
  }, [sfWinners])

  useEffect(() => {
    localStorage.setItem('finalPlayers', JSON.stringify(finalPlayers))
  }, [finalPlayers])

  useEffect(() => {
    if (champion) {
      localStorage.setItem('champion', champion)
    } else {
      localStorage.removeItem('champion')
    }
  }, [champion])

  const updatePlayer = (slotIndex, name) => {
    setPlayers(prev => {
      const newPlayers = [...prev]
      newPlayers[slotIndex] = name
      return newPlayers
    })
  }

  const advanceToBracket = (matchId, winnerName) => {
    // Round 1: QF0-3 → qfWinners
    if (matchId === 'qf0') {
      setQfWinners(prev => { const n = [...prev]; n[0] = winnerName; return n })
    } else if (matchId === 'qf1') {
      setQfWinners(prev => { const n = [...prev]; n[1] = winnerName; return n })
    } else if (matchId === 'qf2') {
      setQfWinners(prev => { const n = [...prev]; n[2] = winnerName; return n })
    } else if (matchId === 'qf3') {
      setQfWinners(prev => { const n = [...prev]; n[3] = winnerName; return n })
    }
    // Round 2: SF0-3 → sfWinners
    else if (matchId === 'sf0') {
      setSfWinners(prev => { const n = [...prev]; n[0] = winnerName; return n })
    } else if (matchId === 'sf1') {
      setSfWinners(prev => { const n = [...prev]; n[1] = winnerName; return n })
    } else if (matchId === 'sf2') {
      setSfWinners(prev => { const n = [...prev]; n[2] = winnerName; return n })
    } else if (matchId === 'sf3') {
      setSfWinners(prev => { const n = [...prev]; n[3] = winnerName; return n })
    }
    // Round 3: Semi-finals → finalPlayers
    else if (matchId === 'semi0') {
      setFinalPlayers(prev => [winnerName, prev[1]])
    } else if (matchId === 'semi1') {
      setFinalPlayers(prev => [prev[0], winnerName])
    }
    // Final → champion
    else if (matchId === 'final') {
      setChampion(winnerName)
    }
  }

  const reset = () => {
    if (confirm('トーナメントをリセットしますか？')) {
      setPlayers(DEFAULT_PLAYERS)
      setQfWinners(Array(4).fill(''))
      setSfWinners(Array(4).fill(''))
      setFinalPlayers(['', ''])
      setChampion(null)
      localStorage.removeItem('tournamentPlayers')
      localStorage.removeItem('qfWinners')
      localStorage.removeItem('sfWinners')
      localStorage.removeItem('finalPlayers')
      localStorage.removeItem('champion')
    }
  }

  return (
    <div className="app">
      <Tournament
        players={players}
        qfWinners={qfWinners}
        sfWinners={sfWinners}
        finalPlayers={finalPlayers}
        champion={champion}
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
