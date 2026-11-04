let sharedAudioContext = null

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') sharedAudioContext = new AudioContextClass()
  return sharedAudioContext
}

export function prepareOrderAudio() {
  try {
    const context = getAudioContext()
    if (!context) return false
    context.resume().catch(() => {})
    return true
  } catch {
    return false
  }
}

export function stopOrderAudio() {
  const context = sharedAudioContext
  sharedAudioContext = null
  if (context && context.state !== 'closed') context.close().catch(() => {})
}
export function playOrderAlert(durationMs = 30000) {
  let context
  let timeout
  let stopped = false

  try {
    context = getAudioContext()
    if (!context) return () => {}
    context.resume().catch(() => {})
    const startedAt = context.currentTime + 0.05
    const endAt = startedAt + Math.max(30000, durationMs) / 1000

    for (let motifAt = startedAt; motifAt < endAt; motifAt += 1.35) {
      ;[740, 880].forEach((frequency, index) => {
        const noteAt = motifAt + index * 0.19
        if (noteAt >= endAt) return
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.value = frequency
        gain.gain.setValueAtTime(0.0001, noteAt)
        gain.gain.exponentialRampToValueAtTime(0.12, noteAt + 0.025)
        gain.gain.exponentialRampToValueAtTime(0.0001, noteAt + 0.18)
        oscillator.connect(gain)
        gain.connect(context.destination)
        oscillator.start(noteAt)
        oscillator.stop(noteAt + 0.19)
      })
    }

    const playbackMs = Math.max(30000, durationMs)
    timeout = window.setTimeout(() => {
      if (sharedAudioContext === context) sharedAudioContext = null
      if (context.state !== 'closed') context.close().catch(() => {})
      stopped = true
    }, playbackMs + 150)
  } catch {
    if (context && context.state !== 'closed') context.close().catch(() => {})
    if (sharedAudioContext === context) sharedAudioContext = null
    return () => {}
  }

  return () => {
    if (stopped) return
    stopped = true
    window.clearTimeout(timeout)
    if (sharedAudioContext === context) sharedAudioContext = null
    if (context.state !== 'closed') context.close().catch(() => {})
  }
}