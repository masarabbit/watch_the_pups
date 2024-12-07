'use strict'

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

tileSizeDefault = (32, 32)
tileFixBleedScale = 0.2

// TODO start game when user clicks on screen
// TODO add more sound
// TODO add time
// TODO make time count down

// TODO update sprite (clean up colour)

//TODO add panting dog
// TODO add score

const sound_bounce = new Sound(
  [, , 1e3, , 0.03, 0.02, 1, 2, , , 940, 0.03, , , , , 0.2, 0.6, , 0.06],
  0,
)

const grid = {
  w: 4,
  h: 2,
}

const gridLayout = (x, y) => {
  return new Array(x * y).fill('')
}

const maxCharacterSpeed = 0.05

objectDefaultDamping = 0.7
objectDefaultAngleDamping = 0.99

function gameInit() {
  // called once after the engine starts up - setup the game
  // pos = cameraPos

  // new Wall(vec2(levelSize.x / -2 + 0.5, 0), vec2(1, levelSize.y)) // left
  // new Wall(vec2(levelSize.x / 2 - 0.5, 0), vec2(1, levelSize.y)) // right
  // new Wall(vec2(0, levelSize.y / -2), vec2(levelSize.x, 1)) // top
  // new Wall(vec2(0, levelSize.y / 2), vec2(levelSize.x, 1)) //bottom

  // TODO these need to be randomised
  // dogs.push(new Dog(vec2(cameraPos.x + 10, cameraPos.y)))
  // dogs.push(new Dog(vec2(cameraPos.x + 20, cameraPos.y + 30), 'bone'))
  // dogs.push(new Dog(vec2(cameraPos.x + 20, cameraPos.y - 30), 'bowl'))

  dogs.push(new Dog(cameraPos, 'brush'))

  new Food(screenToWorld(vec2(mainCanvasSize.x - 80, mainCanvasSize.y - 80)))

  number = new Number(cameraPos, vec2(0.2))
}

function gameUpdate() {
  // called every frame at 60 frames per second - handle input and update the game state
  cameraScale = clamp(cameraScale * (1 - mouseWheel / 10), 1, 1e3)
  dogs.forEach(dog => {
    if (dog.target === 'player') {
      dog.item.velocity = dog.item.velocity.multiply(vec2(0.4))
    }
  })
}

function gameUpdatePost() {
  // called after physics and objects are updated - setup camera and prepare for render
  drawTextScreen(
    'by masahito / ma5a.com',
    vec2(mainCanvasSize.x - 60, mainCanvasSize.y - 10),
    10,
    new Color(0, 0, 0),
  )
}

function gameRender() {
  // called before objects are rendered - draw any background effects that appear behind objects
  drawRect(cameraPos, vec2(50), new Color(0.3, 0.9, 0.8))
}

function gameRenderPost() {
  // called after objects are rendered - draw effects or hud that appear above all objects
  number.pos = screenToWorld(
    vec2(overlayCanvas.width / 2, overlayCanvas.height / 20),
  )
}

// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, [
  'puppy.png',
  'numbers.png',
  'items.png',
])
