class Number extends EngineObject {
  constructor(pos, size) {
    super(pos, size)

    this.color = new Color(1, 1, 1)
    this.offset1 = 0
    this.offset2 = 0
    this.firstDigit = new TileInfo(vec2(12 * this.offset1, 0), vec2(12, 16), 1)
    this.secondDigit = new TileInfo(vec2(12 * this.offset2, 0), vec2(12, 16), 1)
    this.timer = new Timer(0)
  }
  update() {
    const time = Math.round(this.timer.get())

    if (time < 100) {
      const number = `${time}`
      this.offset1 = number[number.length - 2] || 0
      this.offset2 = number[number.length - 1]
    } else {
      this.color = new Color(1, 0.1, 0.3)
      this.offset1 = 9
      this.offset2 = 9
    }

    this.firstDigit.pos = vec2(12 * this.offset1, 0)
    this.secondDigit.pos = vec2(12 * this.offset2, 0)
  }
  render() {
    drawTile(
      this.pos.subtract(vec2(0.1, 0)),
      this.size,
      this.firstDigit,
      this.color,
    )
    drawTile(
      this.pos.add(vec2(0.1, 0)),
      this.size,
      this.secondDigit,
      this.color,
    )
  }
}

class Dog extends EngineObject {
  constructor(pos, item) {
    super(pos, vec2(0.5))
    this.setCollision()
    this.angleDamping = 0
    this.animationFrames = dogAnimationFrames[90].indexes
    this.animationIndex = 0
    this.angle = 90
    this.isDog = true
    this.color = new Color(1, 1, 1)
    this.target = 'player'
    this.isResting = false
    this.item = new Item(pos, this, item)
    this.counter = 0
  }
  update() {
    // this.pos = cameraPos.copy()
    // if (this.item.type === 'brush' && this.item.isSelected) {
    //   this.animationFrames = dogAnimationFrames.happy.indexes
    //   this.velocity = vec2(0)
    //   this.animationIndex += 1
    //   this.angle = getAdjustedAngle(this.pos, this.item.pos)
    // } else
    if (
      this.item.type === 'filledBowl' &&
      this.pos.distance(this.item.pos) < 0.5
    ) {
      this.velocity = vec2(0)
      this.angle = getAdjustedAngle(this.pos, this.targetPos)
      this.animationFrames = dogAnimationFrames[this.angle].indexes
      this.animationIndex += 2
      this.isFeeding = true
      this.counter++
      this.item.tileInfo.pos = vec2(
        32 * (this.counter > 80 ? 3 : this.counter > 40 ? 4 : 5),
      )
      if (this.counter > 140) {
        this.isFeeding = false
        this.isResting = false
        this.item.type = 'bowl'
        this.item.tileInfo.pos = vec2(32 * items.bowl)
        this.item.isFetched = true
      }
    } else if (this.isResting && !this.isFeeding) {
      this.animationFrames = dogAnimationFrames.idle.indexes
      this.animationIndex += 2
      if (this.item.type === 'bowl' && this.pos.distance(this.item.pos) > 0.5) {
        this.isResting = false
      }
    } else {
      this.targetPos =
        this.counter > 140
          ? vec2(this.pos.x, 50)
          : {
              player: mousePos,
              item: this.item.pos,
            }[this.target]
      const gap = this.target === 'player' ? 0.2 : 0.3

      this.angle = getAdjustedAngle(this.pos, this.targetPos)
      this.animationFrames = dogAnimationFrames[this.angle].indexes

      if (this.pos.distance(this.targetPos) > gap && !this.item.isSelected) {
        this.moveInput = vec2(
          this.targetPos.x - this.pos.x,
          this.targetPos.y - this.pos.y,
        )

        this.velocity.x = clamp(
          this.velocity.x + this.moveInput.x * 0.02,
          -maxCharacterSpeed,
          maxCharacterSpeed,
        )

        this.velocity.y = clamp(
          this.velocity.y + this.moveInput.y * 0.02,
          -maxCharacterSpeed,
          maxCharacterSpeed,
        )
      } else {
        this.velocity = vec2(0)

        if (this.target === 'player' && this.item.isFetched) {
          if (this.item.type === 'bowl') {
            this.isResting = true
          }
          this.item.velocity = vec2(0, 0.08).rotate(
            getItemRad(this.pos, mousePos),
          )
          this.item.isFetched = false
        }
        if (this.target === 'item') {
          this.target = 'player'
          this.item.isFetched = true
        }

        this.animationFrames = dogAnimationFrames.happy.indexes
      }
      this.animationIndex += !this.velocity.x && !this.velocity.y ? 1 : 2
    }

    if (this.animationIndex >= this.animationFrames.length - 1)
      this.animationIndex = 0

    super.update()
  }
  render() {
    drawTile(
      this.pos,
      vec2(0.5),
      tile(vec2(32 * this.animationFrames[this.animationIndex])),
      this.color,
      0,
      dogAnimationFrames[this.angle].mirror,
    )
  }
}

const isItemOutsideViewPort = pos => {
  const { x, y } = pos
  return (
    x > levelSize.x / -2 &&
    x < levelSize.x / 2 &&
    y > levelSize.y / -2 &&
    y < levelSize.y / 2
  )
}

class Item extends EngineObject {
  constructor(pos, dog, type) {
    super(pos, vec2(0.5))
    this.setCollision()
    this.size = vec2(0.5)
    this.isSelected = false
    this.color = new Color(1, 1, 1)
    this.throwAngle = 0
    this.type = type || 'ball'
    this.tileInfo = new TileInfo(vec2(32 * items[this.type], 0), vec2(32), 2)
    this.dog = dog
    this.dragStartMousePos = null
    this.dragStartPos = null
    this.maxSpeed = 1
    this.prevPos = null
    this.throwDistance = 1
    this.isFetched = true
    this.frames = walkFrames(vec2(0, -0.02), vec2(0), vec2(0, -0.02))
    this.counter = 0
    this.throwBoost = 0
  }
  update() {
    this.moveInput = vec2(0)
    const dog = this.dog
    if (!isItemOutsideViewPort(this.pos)) {
      dog.target = this.isFetched ? 'player' : 'item'
    }

    if (this.isFetched && !dog.isResting) {
      const offset = this.frames[dog.animationIndex]
      this.pos = dog.pos
        .add(
          dogAnimationFrames[dog.angle]?.[`${this.type}Offset`] ||
            dogAnimationFrames[dog.angle].boneOffset,
        )
        .add(offset)
      this.angle = 0
    } else if (
      mouseWasPressed(0) &&
      !this.isSelected &&
      mousePos.distance(this.pos) < 0.25
    ) {
      selectedItem = this
      this.velocity = vec2(0)
      this.isSelected = true
      if (selectedItem) {
        this.dragStartMousePos = mousePos.copy()
        this.dragStartPos = this.pos.copy()
        this.prevPos = this.pos.copy()
      }
    } else if (mouseIsDown(0) && this.isSelected && selectedItem === this) {
      this.pos = this.dragStartPos.add(
        mousePos.subtract(this.dragStartMousePos),
      )
      this.throwAngle = getItemRad(this.prevPos, this.pos)
      this.throwDistance = this.prevPos.distance(this.pos) * 20
      this.throwBoost += 0.1
      this.prevPos = this.pos.copy()
    } else if (mouseWasReleased(0) && this.isSelected) {
      this.throwBoost = 0
      this.velocity = vec2(0, this.throwDistance + this.throwBoost).rotate(
        this.throwAngle,
      )
      this.isSelected = false
      selectedItem = null
      this.throwDistance = 1
      this.throwBoost = 0

      this.angle = this.throwAngle
      dog.target = 'item'
    }

    super.update()
  }
  render() {
    drawTile(this.pos, vec2(0.5), this.tileInfo, this.color, this.angle)
  }
  collideWithObject(o) {
    return o.dog !== this.dog && o.pos.distance(this.pos) < 0.3
  }
}

class Food extends EngineObject {
  constructor(pos) {
    super(pos, vec2(0.5))
    this.setCollision()
    this.size = vec2(0.5)
    this.isSelected = false
    this.color = new Color(1, 1, 1)
    this.tileInfo = new TileInfo(vec2(32 * items.food, 0), vec2(32), 2)
    this.dragStartMousePos = null
    this.dragStartPos = null
    this.prevPos = null
    this.isFetched = true
    this.frames = walkFrames(vec2(0, -0.02), vec2(0), vec2(0, -0.02))
  }
  update() {
    this.moveInput = vec2(0)
    if (
      mouseWasPressed(0) &&
      !this.isSelected &&
      mousePos.distance(this.pos) < 0.25
    ) {
      selectedItem = this
      this.velocity = vec2(0)
      this.isSelected = true
      if (selectedItem) {
        this.dragStartMousePos = mousePos.copy()
        this.dragStartPos = this.pos.copy()
      }
    } else if (mouseIsDown(0) && this.isSelected) {
      this.pos = this.dragStartPos.add(
        mousePos.subtract(this.dragStartMousePos),
      )
    } else if (mouseWasReleased(0) && this.isSelected) {
      this.isSelected = false
      selectedItem = null
      this.angle = 0
      // dog.target = 'item'
    }

    super.update()
  }
  render() {
    drawTile(this.pos, vec2(0.5), this.tileInfo, this.color, this.angle)
  }
  collideWithObject(o) {
    if (o?.type === 'bowl') {
      this.angle = degToRad(getAdjustedAngle(this.pos, o.pos) < 180 ? 45 : -45)

      sound_bounce.play(this.pos)
      o.counter++
      o.tileInfo.pos = vec2(32 * (o.counter > 80 ? 5 : o.counter > 40 ? 4 : 3))

      if (o.counter > 120) {
        o.type = 'filledBowl'
        o.counter = 0
      }
    } else {
      this.angle = 0
    }
    return false
  }
}

// class Wall extends EngineObject {
//   constructor(pos, size) {
//     super(pos, size)
//     this.setCollision()
//     this.mass = 0
//     this.color = new Color(0, 0, 0.5, 1)
//     this.isWall = true
//   }
// }
