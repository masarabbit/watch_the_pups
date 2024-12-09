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

const nearestN = (x, n) => (x === 0 ? 0 : x - 1 + Math.abs(((x - 1) % n) - n))
const radToDeg = rad => Math.round(rad * (180 / Math.PI))
const degToRad = deg => deg / (180 / Math.PI)

const isItemOutsideViewPort = pos => {
  const { x, y } = pos
  const buffer = 0.5
  return (
    x + buffer > levelSize.x / -2 &&
    x - buffer < levelSize.x / 2 &&
    y + buffer > levelSize.y / -2 &&
    y - buffer < levelSize.y / 2
  )
}

const getRandomPos = (offset = 0) => {
  const x =
    randomN(2) <= 1
      ? 0 - randomN(1000) - offset
      : mainCanvasSize.x + randomN(1000) + offset
  const y =
    randomN(2) <= 1
      ? 0 - randomN(1000) - offset
      : mainCanvasSize.y + randomN(1000) + offset
  return screenToWorld(vec2(x, y))
}

const createNewDog = (item, i) => {
  dogs.push(new Dog(getRandomPos(), item, i))
  if (item === 'bowl') {
    const currentPos = food.pos
    food.destroy()
    food = new Food(currentPos)
  }
}
