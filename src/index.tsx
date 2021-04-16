import React, { useState, useEffect, useCallback, memo } from 'react'
import styles from './styles.module.css'

const noop = () => {}

interface TypewriterConfig {
  words: string[]
  loop?: boolean
  typeSpeed?: number
  deleteSpeed?: number
  delaySpeed?: number
  onLoop?: (loopCount: number) => void
  onDone?: () => void
}

interface TypewriterProps extends TypewriterConfig {
  cursor?: boolean
  cursorStyle?: string
}

export const useTypewriter = (config: TypewriterConfig): string => {
  const {
    words,
    typeSpeed = 100,
    loop = false,
    deleteSpeed = 50,
    delaySpeed = 1500,
    onLoop = noop,
    onDone = noop
  } = config

  // State
  const [speed, setSpeed] = useState<number>(typeSpeed)
  const [text, setText] = useState<string>('')
  const [isDeleting, setDeleting] = useState<boolean>(false)
  const [counter, setCounter] = useState<number>(0)
  const [loopCount, setLoopCount] = useState<number>(0)

  const onSetCounter = (prev: number) => {
    const nextCounter = prev + 1

    // increase loop count, call onLoop callback with completed loop count
    if (loop && nextCounter % words.length === 0) {
      setLoopCount((prev) => {
        const nextLoopCount = prev + 1
        if (nextLoopCount > 0) onLoop(nextLoopCount)
        return nextLoopCount
      })
    }

    return nextCounter
  }

  const handleTyping = useCallback(() => {
    const index: number = loop ? counter % words.length : counter
    const word: string = words[index]

    setSpeed(typeSpeed)

    if (isDeleting) {
      // Set stoping speed
      setSpeed(deleteSpeed)
      setText((prev) => word.substring(0, prev.length - 1))
    } else {
      setText((prev) => word.substring(0, prev.length + 1))
    }

    if (!isDeleting && text === word) {
      if (!loop && counter >= words.length - 1) {
        onDone()
        return
      }

      setDeleting(true)
      setSpeed(delaySpeed)
    } else if (isDeleting && text === '') {
      setDeleting(false)
      setCounter(onSetCounter)
    }
  }, [
    delaySpeed,
    isDeleting,
    counter,
    deleteSpeed,
    loop,
    text,
    typeSpeed,
    words,
    loopCount
  ])

  // Effect
  useEffect(() => {
    const timer = setTimeout(() => handleTyping(), speed)
    return () => clearTimeout(timer)
  }, [handleTyping, speed])

  return text
}

const Typewriter: React.FC<TypewriterProps> = ({
  words,
  loop = false,
  cursor = false,
  cursorStyle = '|',
  typeSpeed = 100,
  delaySpeed = 1500,
  deleteSpeed = 50,
  onLoop = noop,
  onDone = noop
}) => {
  const text = useTypewriter({
    words,
    loop,
    typeSpeed,
    delaySpeed,
    deleteSpeed,
    onLoop,
    onDone
  })

  return (
    <React.Fragment>
      <span>{text}</span>
      {cursor && <span className={styles.blinkingCursor}>{cursorStyle}</span>}
    </React.Fragment>
  )
}

export default memo(Typewriter)
