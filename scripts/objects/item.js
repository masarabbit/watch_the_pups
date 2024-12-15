class Item extends EngineObject {
  constructor(pos, dog, type) {
    super(pos, vec2(0.5))
    this.setCollision()
    this.size = vec2(0.5)
    this.isSelected = false
    this.color = new Color(1, 1, 1)
    this.throwAngle = 0
    this.type = type || 'toy'
    this.sprite = items[this.type].sprite()
    this.tileInfo = new TileInfo(
      this.sprite,
      vec2(32),
      items[this.type].spriteSheet,
    )
    this.dog = dog
    this.dragStartMousePos = null
    this.dragStartPos = null
    this.maxSpeed = 1
    this.prevPos = null
    this.throwDistance = 1
    this.isFetched = true
    this.frames = walkFrames(vec2(0, -0.02), vec2(0), vec2(0, -0.02))
    if (this.type === 'bowl') {
      this.foodAmount = 0
    }
    if (this.isPlayItem()) {
      this.satisfactionPoint = 0
    }
    this.throwBoost = 0
  }
  isPlayItem() {
    return ['toy', 'bone'].includes(this.type)
  }
  update() {
    const dog = this.dog
    if (!isItemInsideViewPort(this.pos)) {
      dog.target = this.isFetched ? 'player' : 'item'
    }

    if (this.isFetched && dog.state !== 'idle') {
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
      !isElementClicked(footer) &&
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
      soundEffect.pickUp.play(this.pos)
    } else if (mouseIsDown(0) && this.isSelected && selectedItem === this) {
      this.pos = this.dragStartPos.add(
        mousePos.subtract(this.dragStartMousePos),
      )
      this.throwAngle = getItemRad(this.prevPos, this.pos)
      this.throwDistance = this.prevPos.distance(this.pos) * 20
      if (this.isPlayItem()) this.throwBoost += 0.1
      this.prevPos = this.pos.copy()
    } else if (mouseWasReleased(0) && this.isSelected) {
      itemThrowSound[this.type].play(this.pos)

      this.throwBoost = 0
      this.velocity = vec2(0, this.throwDistance + this.throwBoost).rotate(
        this.throwAngle,
      )
      this.isSelected = false
      selectedItem = null
      if (this.isPlayItem()) {
        this.satisfactionPoint += this.throwDistance * 5
      }
      this.throwDistance = 1
      this.throwBoost = 0
      this.angle = this.throwAngle
      dog.target = 'item'

      // empty food if bowl tipped over
      if (this.foodAmount && ![0, 360].includes(this.angle)) {
        this.type = 'bowl'
        this.foodAmount = 0
        this.tileInfo.pos = this.sprite
      }
    }

    super.update()
  }
  render() {
    drawTile(this.pos, vec2(0.5), this.tileInfo, this.color, this.angle)
  }
  collideWithObject(o) {
    if (
      this.isSelected &&
      this.type === 'brush' &&
      o === this.dog &&
      this.dog.state !== 'happy'
    ) {
      if (o.pos.distance(this.pos) < 0.5) {
        this.dog.state = 'relax'
        if (this.dog.satisfaction <= 120) {
          this.dog.satisfaction += 0.5
          if (this.dog.satisfaction % 30 === 0)
            soundEffect.brush.play(this.dog.pos)
        } else {
          this.dog.state = 'happy'
        }
      } else {
        this.dog.state = 'default'
      }
    }
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
    this.tileInfo = new TileInfo(vec2(0), vec2(32), 5)
    this.dragStartMousePos = null
    this.dragStartPos = null
    this.prevPos = null
    this.isFetched = false
    this.frames = walkFrames(vec2(0, -0.02), vec2(0), vec2(0, -0.02))
  }
  update() {
    this.motion = vec2(0)

    if (!isItemInsideViewPort(this.pos) && !miniDog) {
      createMiniDog()
      this.destroy()
    }
    if (this.isFetched) {
      const offset = this.frames[miniDog.animationIndex]
      this.pos = miniDog.pos
        .add(dogAnimationFrames[miniDog.angle].foodOffset)
        .add(offset)
      this.angle = 0
    }
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
    }

    super.update()
  }
  render() {
    drawTile(this.pos, vec2(0.5), this.tileInfo, this.color, this.angle)
  }
  collideWithObject(o) {
    if (
      !this.isFetched &&
      this.isSelected &&
      o?.type === 'bowl' &&
      !o?.isFetched &&
      [360, 0].includes(o.angle) &&
      o.foodAmount <= 120
    ) {
      if (o.foodAmount % 20 === 0) soundEffect.pourFood.play(this.pos)
      this.angle = degToRad(getAdjustedAngle(this.pos, o.pos) < 180 ? 45 : -45)
      o.foodAmount++
      o.tileInfo.pos = vec2(
        32 * (o.foodAmount > 80 ? 2 : o.foodAmount > 40 ? 1 : 0),
        o.sprite.y,
      )

      if (o.foodAmount > 120) {
        o.tileInfo.pos = vec2(32 * 3, o.sprite.y)
        soundEffect.foodReady.play(this.pos)
      }
    }
    if (o === miniDog) return o.pos.distance(this.pos) < 0.2
    return true
  }
}
