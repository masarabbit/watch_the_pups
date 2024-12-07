const getRad = (el, el2) => {
  const { x, y } = el
  return Math.atan2(el2.x - x, el2.y - y)
}

const randomN = max => Math.ceil(Math.random() * max)

const getItemRad = (el, el2) => {
  const { x, y } = el2
  return Math.atan2(el.x - x, y - el.y)
}

const getAdjustedAngle = (el, el2) => {
  const angle = radToDeg(getRad(el, el2))
  const adjustedAngle = angle < 0 ? angle + 360 : angle
  return nearestN(adjustedAngle, 45)
}

const calcX = (i, w) => i % w
const calcY = (i, w) => Math.floor(i / w)

const calcPos = (i, w) => {
  const offset = (w - 1) * 0.5 * blockSize
  return vec2(
    calcX(i, w) * blockSize - offset,
    calcY(i, w) * blockSize - offset,
  )
}

const nearestN = (x, n) => (x === 0 ? 0 : x - 1 + Math.abs(((x - 1) % n) - n))
const radToDeg = rad => Math.round(rad * (180 / Math.PI))
const degToRad = deg => deg / (180 / Math.PI)
