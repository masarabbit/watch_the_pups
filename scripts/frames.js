const walkFrames = (a, b, c, repeat = 10) => {
  return [
    ...new Array(repeat).fill('').map(() => a),
    ...new Array(repeat).fill('').map(() => b),
    ...new Array(repeat).fill('').map(() => c),
  ]
}

const twinFrames = (a, b, repeat = 10) => {
  return [
    ...new Array(repeat).fill('').map(() => a),
    ...new Array(repeat).fill('').map(() => b),
  ]
}

const dogAnimationFrames = {
  0: {
    indexes: walkFrames(6, 7, 8),
    mirror: false,
    toyOffset: vec2(0, 0.3),
    boneOffset: vec2(0, 0.31),
    brushOffset: vec2(0, 0.34),
  },
  90: {
    indexes: walkFrames(0, 1, 2),
    mirror: true,
    toyOffset: vec2(0.15, -0.15),
    boneOffset: vec2(0.13, -0.08),
    bowlOffset: vec2(0.13, -0.12),
    brushOffset: vec2(0.15, -0.14),
  },
  180: {
    indexes: walkFrames(3, 4, 5),
    mirror: false,
    toyOffset: vec2(0, -0.2),
    boneOffset: vec2(0, -0.15),
    bowlOffset: vec2(0, -0.19),
    brushOffset: vec2(0, -0.21),
  },
  270: {
    indexes: walkFrames(0, 1, 2),
    mirror: false,
    toyOffset: vec2(-0.15),
    boneOffset: vec2(-0.13, -0.08),
    bowlOffset: vec2(-0.13, -0.12),
    brushOffset: vec2(-0.1, -0.14),
  },
  idle: {
    indexes: twinFrames(9, 10),
  },
  relax: {
    indexes: twinFrames(11, 12),
  },
  happy: {
    indexes: twinFrames(13, 14, 8),
  },
}

;[45, 135].forEach(angle => {
  dogAnimationFrames[angle] = dogAnimationFrames[90]
})
;[225, 315].forEach(angle => {
  dogAnimationFrames[angle] = dogAnimationFrames[270]
})

dogAnimationFrames[360] = dogAnimationFrames[0]

const items = {
  toy: {
    sprite: () => vec2(-32 * randomN(4) - 1, 0),
    spriteSheet: 3,
  },
  bone: {
    sprite: () => vec2(-32 * randomN(4) - 1, 0),
    spriteSheet: 7,
  },
  brush: {
    sprite: () => vec2(-32 * randomN(4) - 1, 0),
    spriteSheet: 6,
  },
  bowl: {
    sprite: () => vec2(0, 32 * randomN(4) - 1),
    spriteSheet: 4,
  },
}

const reactions = {
  star: 0,
  heart: 1,
  sun: 2,
}
