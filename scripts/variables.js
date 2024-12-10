const menus = document.querySelectorAll('.menu')
const dogs = []
let selectedItem
let timeCount
let gameTime
let gameScore
let food
let isGamePaused = true

tileSizeDefault = (32, 32)
tileFixBleedScale = 0.2
objectDefaultDamping = 0.7
objectDefaultAngleDamping = 0.99

cameraScale = 4 * 32
let levelSize = vec2(
  Math.round(window.innerWidth / cameraScale),
  Math.round(window.innerHeight / cameraScale),
)

window.addEventListener('resize', () => {
  levelSize = vec2(
    Math.round(window.innerWidth / cameraScale),
    Math.round(window.innerHeight / cameraScale),
  )
})

const itemTypes = ['bone', 'bowl', 'ball', 'brush']

//music
let timeline = 0
let timer
let music
