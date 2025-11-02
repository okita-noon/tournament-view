import { useState, useEffect } from 'react'
import Tournament from './components/Tournament'
import { SLOT_POSITIONS } from './tournamentConfig'
import './App.css'

function App() {
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('tournamentPlayers')
    return saved ? JSON.parse(saved) : Array(12).fill('')
  })

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

  const selectWinner = (matchId, slotIndex) => {
    let playerName

    if (matchId === 'final') {
      playerName = finalPlayers[slotIndex]
    } else {
      playerName = players[slotIndex]
    }

    if (!playerName) return

    // Quarter finals
    if (matchId === 'qf0') {
      setPlayers(prev => { const n = [...prev]; n[2] = playerName; return n })
    } else if (matchId === 'qf1') {
      setPlayers(prev => { const n = [...prev]; n[5] = playerName; return n })
    } else if (matchId === 'qf2') {
      setPlayers(prev => { const n = [...prev]; n[8] = playerName; return n })
    } else if (matchId === 'qf3') {
      setPlayers(prev => { const n = [...prev]; n[11] = playerName; return n })
    }
    // Semi finals
    else if (matchId === 'sf0') {
      setFinalPlayers(prev => [playerName, prev[1]])
    } else if (matchId === 'sf1') {
      setFinalPlayers(prev => [prev[0], playerName])
    }
    // Final
    else if (matchId === 'final') {
      setChampion(playerName)
    }
  }

  const reset = () => {
    if (confirm('トーナメントをリセットしますか？')) {
      setPlayers(Array(12).fill(''))
      setFinalPlayers(['', ''])
      setChampion(null)
      localStorage.removeItem('tournamentPlayers')
      localStorage.removeItem('finalPlayers')
      localStorage.removeItem('champion')
    }
  }

  return (
    <div className="app">
      <Tournament
        players={players}
        finalPlayers={finalPlayers}
        champion={champion}
        updatePlayer={updatePlayer}
        selectWinner={selectWinner}
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
