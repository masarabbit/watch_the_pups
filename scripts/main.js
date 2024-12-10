'use strict'
// TODO add instruction
// TODO add music toggle

// TODO add pause button image
// TODO add intro image ? (based on new dog sprites)

const startGame = () => {
  itemTypes.forEach((item, i) => {
    dogs.push(new Dog(getRandomPos(i * 1000), item, i))
  })
  food = new Food(
    screenToWorld(vec2(mainCanvasSize.x - 80, mainCanvasSize.y - 80)),
  )

  gameTime = new Time(cameraPos, vec2(0.2))
  gameScore = new Score(cameraPos, vec2(0.2))
}

const reStartGame = () => {
  if (dogs.length) {
    dogs.forEach(dog => {
      dog.item.destroy()
      dog.destroy()
    })
    dogs.length = 0
  }
  if (food) food.destroy()
  if (gameTime) gameTime.destroy()
  if (gameScore) gameScore.destroy()
  startGame()
}
function gameInit() {
  // called once after the engine starts up - setup the game
  startGame()
}

function gameUpdate() {
  // called every frame at 60 frames per second - handle input and update the game state
  // cameraScale = clamp(cameraScale * (1 - mouseWheel / 10), 1, 1e3)
  dogs.forEach(dog => {
    if (dog?.target === 'player') {
      dog.item.velocity = dog.item.velocity.multiply(vec2(0.4))
    }
  })
}

function gameUpdatePost() {
  // called after physics and objects are updated - setup camera and prepare for render
  // const menuVisible = getMenuVisible()
  // paused = menuVisible
  paused = isGamePaused

  drawTextScreen(
    'score',
    vec2(mainCanvasSize.x - gameScore, 12),
    16,
    new Color(0, 0.3, 0.3),
  )
}

function gameRender() {
  // called before objects are rendered - draw any background effects that appear behind objects

  drawRect(cameraPos, vec2(50), new Color(0.3, 0.9, 0.8))
}

function gameRenderPost() {
  // called after objects are rendered - draw effects or hud that appear above all objects
  gameTime.pos = screenToWorld(
    vec2(overlayCanvas.width / 15, overlayCanvas.height / 26),
  )
  gameScore.pos = screenToWorld(
    vec2(overlayCanvas.width * (14 / 15), overlayCanvas.height / 26),
  )
}

// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, [
  'puppies.png',
  'numbers.png',
  'reactions.png',
  'balls.png',
  'foods.png',
  'other.png',
])

function init() {
  const menus = document.querySelectorAll('.menu')

  document.querySelectorAll('.start-btn').forEach((b, i) => {
    b.addEventListener('click', () => {
      isGamePaused = false
      menus[i].classList.add('d-none')
      soundEffect.start.play(mousePos)
      setTimeout(() => startMusic(mainMusic), 1000)
      if (i) reStartGame()
    })
  })

  document.querySelector('.pause-btn').addEventListener('click', e => {
    if (!dogs.length) return

    isGamePaused = !isGamePaused
    if (isGamePaused) {
      e.target.innerText = 'resume'
      soundEffect.pause.play(mousePos)
      stopMusic()
    } else {
      e.target.innerText = 'pause'
      soundEffect.start.play(mousePos)
      setTimeout(() => startMusic(mainMusic), 1000)
    }
  })
}

window.addEventListener('DOMContentLoaded', init)
