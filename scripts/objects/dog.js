class Reaction extends EngineObject {
  constructor(dog) {
    super(vec2(dog.pos.x, dog.pos.y + 0.5), vec2(0.5))
    this.size = vec2(0.5)
    this.dog = dog
    this.tileInfo = new TileInfo(
      vec2(
        32 *
          reactions[
            {
              bone: 'star',
              toy: 'star',
              brush: 'heart',
              bowl: 'sun',
            }[dog.item.type]
          ],
        2,
      ),
      vec2(32),
      2,
    )
  }
  update() {
    this.pos = vec2(this.dog.pos.x, this.dog.pos.y + 0.5)
    if (this.dog.lingerCount >= 200) {
      this.destroy()
      createNewDog(
        itemTypes.filter(item => item !== this.dog.item.type)[randomN(3) - 1],
        randomN(4) - 1,
      )
      if (gameScore.number > 800)
        createNewDog(this.dog.item.type, randomN(7) - 1)
    }
    super.update()
  }
  render() {
    drawTile(this.pos, vec2(0.5), this.tileInfo)
  }
}

class Dog extends EngineObject {
  constructor(pos, item, i) {
    super(pos, vec2(0.5))
    this.setCollision()
    this.startingPos = pos
    this.angleDamping = 0
    this.animationFrames = dogAnimationFrames[90].indexes
    this.animationIndex = 0
    this.angle = 90
    this.isDog = true
    this.color = new Color(1, 1, 1)
    this.target = 'player'
    this.item = new Item(pos, this, item)
    this.satisfaction = 0
    this.lingerCount = 0
    this.state = 'default'
    this.maxSpeed = 0.05
    this.dogIndex = i
    this.reaction = null
  }
  eat() {
    this.velocity = vec2(0)
    if (this.targetPos) this.angle = getAdjustedAngle(this.pos, this.targetPos)
    this.animationFrames = dogAnimationFrames[this.angle].indexes
    this.state = 'feeding'
    this.satisfaction++
    if (this.satisfaction % 20 === 0) soundEffect.munch.play(this.pos)
    this.item.tileInfo.pos = vec2(
      32 *
        (this.satisfaction > 120
          ? 0
          : this.satisfaction > 80
          ? 1
          : this.satisfaction > 40
          ? 2
          : 3),
      this.item.sprite.y,
    )
    if (this.satisfaction > 120) {
      this.state = 'happy'
      this.item.type = 'bowl'
      this.item.tileInfo.pos = this.item.sprite
    }
  }
  releaseItem() {
    if (this.target === 'player' && this.item.isFetched) {
      if (this.item.type === 'bowl') {
        this.state = 'idle'
      }
      if (this.item.isPlayItem()) {
        this.satisfaction += this.item.satisfactionPoint + 40
        this.item.satisfactionPoint = 0
      }
      this.item.velocity = vec2(0, 0.08).rotate(getItemRad(this.pos, mousePos))
      this.item.isFetched = false
      soundEffect.releaseItem.play(this.item.pos)
    }
  }
  moveAbout() {
    if (this.pos.distance(this.startingPos) < 1 && this.satisfaction > 120) {
      this.item.destroy()
      this.destroy()
    }

    this.targetPos =
      this.satisfaction > 120 && this.item.isFetched
        ? this.startingPos
        : {
            player: mousePos,
            item: this.item.pos,
          }[this.target]

    this.angle = getAdjustedAngle(this.pos, this.targetPos)
    this.animationFrames = dogAnimationFrames[this.angle].indexes

    const gap = this.target === 'player' ? 0.2 : 0.3
    if (this.pos.distance(this.targetPos) > gap && !this.item.isSelected) {
      this.motion = vec2(
        this.targetPos.x - this.pos.x,
        this.targetPos.y - this.pos.y,
      )

      this.velocity.x = clamp(
        this.velocity.x + this.motion.x * 0.02,
        -this.maxSpeed,
        this.maxSpeed,
      )
      this.velocity.y = clamp(
        this.velocity.y + this.motion.y * 0.02,
        -this.maxSpeed,
        this.maxSpeed,
      )
    } else {
      this.velocity = vec2(0)
      this.releaseItem()
      if (this.target === 'item') {
        soundEffect.fetch.play(this.pos)
        this.target = 'player'
        this.item.isFetched = true
      }
      this.animationFrames =
        dogAnimationFrames[this.state === 'relax' ? 'relax' : 'happy'].indexes
    }
  }
  updateScore() {
    gameScore.number += {
      bone: 100,
      toy: 100,
      bowl: 500,
      brush: 300,
    }[this.item.type]
    gameScore.updateScore()
  }
  update() {
    if (this.target === 'player') {
      this.item.velocity = this.item.velocity.multiply(vec2(0.4))
    }

    if (this.satisfaction > 120 && !this.item.isFetched) {
      if (this.lingerCount <= 200) {
        if (!this.reaction) {
          this.reaction = new Reaction(this)
          this.updateScore()
          soundEffect.happy.play(this.pos)
        }
        this.lingerCount++
        this.animationFrames = dogAnimationFrames.happy.indexes
      } else {
        this.target = 'item'
        this.moveAbout()
      }
    } else if (
      // when food is ready
      this.item.foodAmount > 120 &&
      this.satisfaction <= 120 &&
      this.pos.distance(this.item.pos) < 0.4
    ) {
      this.eat()
    } else if (this.state === 'idle') {
      this.animationFrames = dogAnimationFrames.idle.indexes
      if (this.item.type === 'bowl' && this.pos.distance(this.item.pos) > 0.5) {
        this.state = 'default'
      }
    } else {
      this.moveAbout()
    }
    this.animationIndex +=
      (!this.velocity.x && !this.velocity.y) || this.lingerCount <= 200 ? 1 : 2

    if (this.animationIndex >= this.animationFrames.length - 1)
      this.animationIndex = 0
    super.update()
  }
  render() {
    drawTile(
      this.pos,
      vec2(0.5),
      tile(
        vec2(
          32 * this.animationFrames[this.animationIndex],
          32 * this.dogIndex,
        ),
      ),
      this.color,
      0,
      dogAnimationFrames[this.angle].mirror,
    )
  }
}
