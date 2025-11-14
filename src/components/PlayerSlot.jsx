import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

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
  slotImage = null
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

  // 画像を使う場合
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
            opacity: isLoser ? 0.5 : 1,
            filter: isLoser ? 'grayscale(100%)' : 'none'
          }}
        />
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
