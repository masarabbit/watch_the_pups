class Time extends EngineObject {
  constructor(pos, size) {
    super(pos, size)

    this.color = new Color(1, 1, 1)
    this.offset1 = 0
    this.offset2 = 0
    this.firstDigit = new TileInfo(vec2(12 * this.offset1, 0), vec2(12, 16), 1)
    this.secondDigit = new TileInfo(vec2(12 * this.offset2, 0), vec2(12, 16), 1)
    this.timer = new Timer(60)
  }
  getOffset(numberFromLast) {
    const number = `${this.time}`
    return number[number.length - numberFromLast] || 0
  }
  update() {
    this.time = Math.abs(Math.round(this.timer.get()))

    if (this.time < 100) {
      this.offset1 = this.getOffset(2)
      this.offset2 = this.getOffset(1)
    } else {
      this.offset1 = 9
      this.offset2 = 9
    }

    if (this.time < 30) {
      this.color = new Color(1, 0.1, 0.3)
    }

    if (music) {
      if (this.time === 40) music.bpm = 110
      if (this.time === 30) music.bpm = 130
      if (this.time === 10) music.bpm = 160
    }

    if (this.time < 10) {
      this.color = new Color(1, 0.1, 0.3)
    }

    if (this.time === 0) {
      this.timer.unset()
      isGamePaused = true
      startMusic(endMusic)
      menus[1].classList.remove('d-none')
      clearTimeout(musicTimer)
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

class Score extends EngineObject {
  constructor(pos, size) {
    super(pos, size)
    this.color = new Color(1, 1, 1)
    this.number = 0
    this.updateScore()
  }
  updateScore() {
    this.tileInfos = `${this.number}`
      .split('')
      .reverse()
      .map(digit => {
        return new TileInfo(vec2(12 * (+digit || 0), 0), vec2(12, 16), 1)
      })
  }
  render() {
    this.tileInfos.forEach((tile, i) => {
      drawTile(this.pos.subtract(vec2(0.2 * i, 0)), this.size, tile, this.color)
    })
  }
}

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
        randomN(7) - 1,
      )
      if (gameScore.number > 1000)
        createNewDog(this.dog.item.type, randomN(7) - 1)
    }
    super.update()
  }
  render() {
    drawTile(this.pos, vec2(0.5), this.tileInfo)
  }
}
