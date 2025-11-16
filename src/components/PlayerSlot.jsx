import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { DEBUG_SHOW_CENTER_MARKERS, AVAILABLE_PLAYERS } from '../tournamentConfig'

function PlayerSlot({
  name,
  placeholder,
  isInput,
  isLoser = false,
  onNameChange,
  onSelect,
  disabled,
  buttonText = '勝',
  animateEntry,
  slotImage = null,
  allPlayers = [],
  currentSlot = -1
}) {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if (animateEntry && name) {
      setShouldAnimate(true)
      const timer = setTimeout(() => setShouldAnimate(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [animateEntry, name])

  const handleSelect = () => {
    if (!disabled) {
      onSelect()
    }
  }

  const variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1]
      }
    },
    flash: {
      borderColor: ['rgba(139, 0, 0, 0.5)', '#FFD700', '#FFD700', 'rgba(139, 0, 0, 0.5)'],
      boxShadow: [
        '0 4px 15px rgba(0, 0, 0, 0.5)',
        '0 0 30px rgba(255, 215, 0, 1)',
        '0 0 30px rgba(255, 215, 0, 1)',
        '0 4px 15px rgba(0, 0, 0, 0.5)'
      ],
      transition: {
        duration: 1,
        times: [0, 0.3, 0.7, 1]
      }
    }
  }

  // 入力モードで選手が選ばれていない場合はプルダウンを表示
  if (isInput && !name) {
    // すでに選ばれている選手を除外（自分のスロットは除く）
    const selectedPlayers = allPlayers.filter((p, idx) => p && idx !== currentSlot)
    const availableOptions = AVAILABLE_PLAYERS.filter(p => !selectedPlayers.includes(p))

    return (
      <div
        className="player-input-container"
        style={{
          position: 'absolute',
          left: '25%',
          top: '0',
          width: '50%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <select
          value={name}
          onChange={(e) => onNameChange && onNameChange(e.target.value)}
          className="player-name-select"
          style={{
            width: '100%',
            height: '100%',
            fontSize: '1rem',
            textAlign: 'center',
            border: 'none',
            borderRadius: '0',
            background: 'transparent',
            color: 'transparent',
            padding: '0',
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            outline: 'none',
          }}
        >
          <option value="" style={{ color: '#fff' }}></option>
          {availableOptions.map((player) => (
            <option key={player} value={player} style={{ color: '#fff', background: 'rgba(0, 0, 0, 0.9)' }}>
              {player}
            </option>
          ))}
        </select>
      </div>
    )
  }

  // 入力モードで選手が選ばれている場合は画像を表示（クリックで選択解除）
  if (isInput && name && slotImage) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <img
          src={slotImage}
          alt={name || placeholder}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            opacity: 1,
          }}
        />
        {/* 中央50%のクリック可能領域 */}
        <div
          className="player-image-slot-input"
          onClick={() => onNameChange && onNameChange('')}
          style={{
            cursor: 'pointer',
            position: 'absolute',
            left: '25%',
            top: '0',
            width: '50%',
            height: '100%',
            zIndex: 10,
          }}
          title="クリックで選択解除"
        />
      </div>
    )
  }

  // 画像を使う場合（対戦モード）
  if (slotImage) {
    return (
      <motion.div
        className={`player-image-slot ${disabled ? 'disabled' : 'clickable'} ${isLoser ? 'loser' : ''}`}
        initial={shouldAnimate ? "initial" : false}
        animate={shouldAnimate ? ["animate", "flash"] : {}}
        variants={variants}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        transition={{ duration: 0.2 }}
        onClick={handleSelect}
        style={{
          cursor: disabled ? 'default' : 'pointer',
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      >
        <img
          src={slotImage}
          alt={name || placeholder}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            opacity: 1,
            filter: isLoser ? 'grayscale(100%) brightness(1.3) contrast(0.8)' : 'none'
          }}
        />
        {/* デバッグ用: 中心点マーカー */}
        {DEBUG_SHOW_CENTER_MARKERS && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '10px',
              height: '10px',
              backgroundColor: '#00ff00',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 100,
              border: '2px solid #000'
            }}
          />
        )}
      </motion.div>
    )
  }

  // 従来のHTML/CSS表示
  return (
    <motion.div
      className={`player ${disabled ? 'disabled' : 'clickable'} ${isLoser ? 'loser' : ''}`}
      initial={shouldAnimate ? "initial" : false}
      animate={shouldAnimate ? ["animate", "flash"] : {}}
      variants={variants}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
      onClick={handleSelect}
      style={{ cursor: disabled ? 'default' : 'pointer' }}
    >
      <span className="player-name">{name || placeholder}</span>
    </motion.div>
  )
}

export default PlayerSlot
