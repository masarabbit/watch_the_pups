const menus = document.querySelectorAll('.menu')
const startBtns = document.querySelectorAll('.start-btn')
const pauseBtn = document.querySelector('.pause-btn')
const soundBtn = document.querySelector('.sound-btn')
const footer = document.querySelector('footer')
const dogs = []
let miniDog
let selectedItem
let timeCount
let gameTime
let gameScore
let food
let isGamePaused = true
let musicTimer
let clickedElement
const buttons = []

tileSizeDefault = (32, 32)
tileFixBleedScale = 0.2
objectDefaultDamping = 0.7
objectDefaultAngleDamping = 0.99
const getDefaultFoodPos = () =>
  screenToWorld(vec2(mainCanvasSize.x - 50, mainCanvasSize.y - 80))

cameraScale = 4 * 32
let levelSize = vec2(
  Math.round(window.innerWidth / cameraScale),
  Math.round(window.innerHeight / cameraScale),
)

const itemTypes = ['bone', 'bowl', 'toy', 'brush']

//music
let timeline = 0
let timer
let music
