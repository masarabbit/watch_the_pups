'use strict'
// TODO adjust sprite colours to make them consistent
// TODO block out section so pause button doesn't get in the way
// TODO add time and score icon or text?

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
      if (dog.reaction) dog.reaction.destroy()
      dog.destroy()
    })
    dogs.length = 0
  }
  if (food) food.destroy()
  if (gameTime) gameTime.destroy()
  if (gameScore) gameScore.destroy()
  startGame()
}

const togglePause = () => {
  if (!gameTime.time) return
  isGamePaused = !isGamePaused
  if (isGamePaused) {
    pauseBtn.innerText = 'resume'
    soundEffect.pause.play(mousePos)
    clearTimeout(musicTimer)
    stopMusic()
  } else {
    pauseBtn.innerText = 'pause'
    soundEffect.start.play(mousePos)
    clearTimeout(musicTimer)
    musicTimer = setTimeout(() => startMusic(mainMusic), 1000)
  }
}

const toggleSound = () => {
  if (soundEnable) soundEffect.pause.play(mousePos)
  soundEnable = !soundEnable
  if (!soundEnable) {
    soundBtn.innerText = 'sound: off'
    clearTimeout(musicTimer)
    stopMusic()
  } else {
    soundBtn.innerText = 'sound: on'

    soundEffect.start.play(mousePos)
    clearTimeout(musicTimer)
    if (!isGamePaused)
      musicTimer = setTimeout(() => startMusic(mainMusic), 1000)
  }
}

// window.addEventListener('resize', () => {
//   if (!isGamePaused) togglePause()
//   levelSize = vec2(
//     Math.round(window.innerWidth / cameraScale),
//     Math.round(window.innerHeight / cameraScale),
//   )
// })

function gameInit() {
  // called once after the engine starts up - setup the game
  vec2(worldToScreen(300))
  startGame()
  // startMusic(introMusic)
}

function gameUpdate() {
  // called every frame at 60 frames per second - handle input and update the game state
  cameraScale = clamp(cameraScale * (1 - mouseWheel / 10), 1, 1e3)
  dogs.forEach(dog => {
    if (dog?.target === 'player') {
      dog.item.velocity = dog.item.velocity.multiply(vec2(0.4))
    }
  })
}

function gameUpdatePost() {
  // called after physics and objects are updated - setup camera and prepare for render

  if (mouseWasPressed(0)) {
    if (
      isGamePaused &&
      (isElementClicked(startBtns[0]) || isElementClicked(startBtns[1]))
    ) {
      isGamePaused = false
      pauseBtn.classList.remove('d-none')
      soundEffect.start.play(mousePos)
      clearTimeout(musicTimer)
      stopMusic()
      if (clickedElement === 'play-again') reStartGame()
      menus[['start', 'play-again'].indexOf(clickedElement)]?.classList.add(
        'd-none',
      )
      musicTimer = setTimeout(() => startMusic(mainMusic), 1000)
    } else if (isElementClicked(pauseBtn)) {
      togglePause()
    }

    if (isElementClicked(soundBtn)) toggleSound()
  }

  // drawTextScreen(
  //   'score',
  //   vec2(mainCanvasSize.x - gameScore, 12),
  //   16,
  //   new Color(0, 0.3, 0.3),
  // )
  paused = isGamePaused
}

function gameRender() {
  // called before objects are rendered - draw any background effects that appear behind objects

  drawRect(cameraPos, vec2(50), new Color(0.3, 0.9, 0.8))
}

function gameRenderPost() {
  // called after objects are rendered - draw effects or hud that appear above all objects
  gameTime.pos = screenToWorld(vec2(overlayCanvas.width / 15 + 10, 36))
  gameScore.pos = screenToWorld(vec2(overlayCanvas.width * (14 / 15) + 2, 36))
}

// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, [
  'puppies.png',
  'numbers.png',
  'reactions.png',
  'toys.png',
  'foods.png',
  'food.png',
  'brushes.png',
  'bones.png',
])
