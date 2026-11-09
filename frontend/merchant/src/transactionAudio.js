let transactionAudioContext = null
let cleanupTimer = null

function getContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null
  if (!transactionAudioContext || transactionAudioContext.state === 'closed') {
    transactionAudioContext = new AudioContextClass()
  }
  return transactionAudioContext
}

export function prepareTransactionAudio() {
  try {
    const context = getContext()
    if (!context) return false
    context.resume().catch(() => {})
    return true
  } catch {
    return false
  }
}

export function playTransactionResult(status) {
  try {
    const context = getContext()
    if (!context) return
    context.resume().catch(() => {})
    const successful = status === 'COMPLETED'
    const notes = successful ? [659.25, 880, 1174.66] : [392, 293.66]
    const startAt = context.currentTime + 0.04
    const gap = successful ? 0.14 : 0.24

    notes.forEach((frequency, index) => {
      const at = startAt + index * gap
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = successful ? 'sine' : 'triangle'
      oscillator.frequency.setValueAtTime(frequency, at)
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(successful ? 0.1 : 0.12, at + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + (successful ? 0.12 : 0.2))
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(at)
      oscillator.stop(at + (successful ? 0.14 : 0.22))
    })

    window.clearTimeout(cleanupTimer)
    cleanupTimer = window.setTimeout(() => {
      if (transactionAudioContext === context && context.state !== 'closed') {
        context.close().catch(() => {})
        transactionAudioContext = null
      }
    }, 1000)
  } catch {
    // Audio feedback is optional; it must never interrupt transfer status handling.
  }
}
