const unpackMusic = music => {
  return music.split('-').map(block => {
    const blockArr = block.split('.')
    const y = +blockArr[0]
    const note = blockArr[1]
    const octave = blockArr[2]
    const oscType = {
      w: 'sawtooth',
      t: 'triangle',
      q: 'square',
      s: 'sine',
    }[blockArr[3]]
    return {
      note,
      octave,
      oscType,
      y,
    }
  })
}

const mainMusic = {
  notes: unpackMusic(
    '0.d.4.t-2.e.4.t-4.d.4.t-6.e.4.t-8.d.4.t-0.c.5.q-4.c.5.q-2.g.5.q-6.g.5.q-8.a.5.q-9.a.5.q-10.a.5.q-12.b.5.q-13.a.5.q-14.g.5.q-12.d.4.t-14.e.4.t-10.g.4.t-16.d.4.t-18.e.4.t-20.d.4.t-22.g.4.t-16.c.5.q-19.g.5.q-24.d.4.t-26.e.4.t-28.d.4.t-30.e.4.t-17.c.5.q-18.g.5.q-20.c.5.q-21.c.5.q-22.g.5.q-23.g.5.q-25.a.5.q-26.a.5.q-27.a.5.q-29.b.5.q-30.a.5.q-31.g.5.q-32.d.4.t-34.g.4.t-33.a.5.w-34.a.5.w-35.a.5.w-37.b.5.w-38.a.5.w-39.g.5.w-36.d.4.t-38.e.4.t-40.d.4.t-42.e.4.t-44.d.4.t-46.g.4.t-41.a.4.q-42.a.4.q-43.a.4.q-46.a.4.q-47.g.4.q-45.b.4.q',
  ),
  defaultBpm: 100,
  bpm: 100,
  loop: true,
  musicLength: 48,
}

const endMusic = {
  notes: unpackMusic(
    '0.c#.4.w-1.d#.4.w-2.f#.4.w-4.g#.4.w-6.f#.4.w-4.g#.5.t-6.f#.5.t-8.c#.4.q-9.d#.4.q-10.f#.4.q-10.f#.5.s',
  ),
  defaultBpm: 140,
  bpm: 140,
  loop: false,
  musicLength: 12,
}

const introMusic = {
  notes: unpackMusic(
    '2.c.5.t-6.g.5.t-10.c.5.t-14.g.5.t-18.d.5.t-22.a.5.t-26.d.5.t-30.a.5.t-2.a.4.q-3.a.4.q-6.b.4.q-10.g.4.q-11.g.4.q-14.a.4.q-18.a.4.q-20.b.4.q-22.e.5.q-24.g.5.q-26.e.5.q-28.d.5.q-8.g.6.w-7.f.6.w-9.b.6.w-12.d.6.w-13.e.6.w-14.f.6.w-15.g.6.w-19.f.6.w-20.g.6.w-21.b.6.w-22.e.6.w-23.g.6.w-24.f.6.w-25.g.6.w-26.a.6.w-28.b.6.w-31.g.6.w-30.a.6.w',
  ),
  defaultBpm: 110,
  bpm: 110,
  loop: true,
  musicLength: 32,
}

const startMusic = track => {
  if (!soundEnable) return
  stopMusic()
  music = track
  music.bpm = music.defaultBpm
  playMusic()
}

// prettier-ignore
const getFrequency = (note, octave) => {
  const num = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'].indexOf(note)
  const freq = 440 * Math.pow(2, (octave * 12 + num - 57) / 12)
  return +freq.toFixed(4)
}
const getSpeed = bpm => (60 / bpm) * 500

const ctx = new AudioContext()

const stopMusic = () => {
  timeline = 0
  clearTimeout(timer)
  timer = null
}

const playBlock = block => {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  oscillator.type = block.oscType
  oscillator.frequency.value = getFrequency(block.note, block.octave)

  gainNode.gain.setValueAtTime(
    {
      sine: 0.4,
      triangle: 0.3,
      square: 0.1,
      sawtooth: 0.1,
    }[oscillator.type],
    0,
  )
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.start(0)
  oscillator.stop(ctx.currentTime + 1)
}

const playMusic = playOn => {
  if (!music) return
  if (!playOn) stopMusic()
  music.notes.forEach(block => {
    if (block.y === timeline) playBlock(block)
  })
  timeline++
  if (timeline <= music.musicLength) {
    timer = setTimeout(() => {
      playMusic(true)
    }, getSpeed(music.bpm))
  } else {
    stopMusic()
    if (music.loop) {
      playMusic()
    }
  }
}
