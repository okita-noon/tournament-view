import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

function PlayerSlot({
  name,
  placeholder,
  isInput,
  onNameChange,
  onSelect,
  disabled,
  buttonText = '勝',
  animateEntry
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
    if (!disabled && name) {
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

  return (
    <motion.div
      className="player"
      initial={shouldAnimate ? "initial" : false}
      animate={shouldAnimate ? ["animate", "flash"] : {}}
      variants={variants}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {isInput ? (
        <input
          type="text"
          className="player-name"
          placeholder={placeholder}
          value={name || ''}
          onChange={(e) => onNameChange(e.target.value)}
        />
      ) : (
        <span className="player-name">{name}</span>
      )}
      <button
        className="advance-bracket-btn"
        onClick={handleSelect}
        disabled={disabled || !name || (isInput && !name.trim())}
      >
        {buttonText}
      </button>
    </motion.div>
  )
}

export default PlayerSlot
