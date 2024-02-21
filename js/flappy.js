function newElement(tagName, className){
    const e = document.createElement(tagName)
    e.className = className
    return e
}

function Barrier(inverted = false){
    this.element = newElement('div', 'barrier')

    const edge = newElement('div', 'edge')
    const structure = newElement('div', 'structure')
    
    this.element.appendChild(inverted ? structure : edge)
    this.element.appendChild(inverted ? edge : structure)

    this.setHeight = height => structure.style.height = `${height}px`  

}

function PairOfBarriers(height, opening, x){
    this.element = newElement('div', 'barriers')

    this.higher = new Barrier(true)
    this.lower = new Barrier(false)

    this.element.appendChild(this.higher.element)
    this.element.appendChild(this.lower.element)

    this.drawOpening = () => {
        const higherHeight = Math.random() * (height - opening)
        const lowerHeight = (height - opening - higherHeight) - 0.3
        this.higher.setHeight(higherHeight)
        this.lower.setHeight(lowerHeight)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.drawOpening()
    this.setX(x)
}

function Barriers(height, width, opening, space, scoreCallback){
    this.pairs = [
        new PairOfBarriers(height, opening, width),
        new PairOfBarriers(height, opening, width + space),
        new PairOfBarriers(height, opening, width + space * 2),
        new PairOfBarriers(height, opening, width + space * 3)
    ]

    const displacement = 3
    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            //when the element leaves the game area
            if(pair.getX() < -pair.getWidth()){
                pair.setX(pair.getX() + space * this.pairs.length)
                pair.drawOpening()
            }

            const middle = width / 2
            const crossedMiddle = pair.getX() + displacement >= middle && pair.getX() < middle
            if(crossedMiddle) scoreCallback()
        })
    }
}

function FlappyDog(heightGameArea){
    let flying = false

    this.element = newElement('img', 'dog')
    this.element.src = 'imgs/dog.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false
    window.onmousedown = e => flying = true
    window.onmouseup = e => flying = false

    this.animate = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const maxHeight = heightGameArea - this.element.clientHeight

        if(newY <= 0){
            this.setY(0)
        } else if(newY >= maxHeight){
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }

    this.setY(heightGameArea / 2)
}

function areOverlapping(elementA, elementB){
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function collided(flappyDog, barriers){
    let collided = false
    barriers.pairs.forEach(pairOfBarriers => {
        if(!collided){
            const higher = pairOfBarriers.higher.element
            const lower = pairOfBarriers.lower.element
            collided = areOverlapping(flappyDog.element, higher) || areOverlapping(flappyDog.element, lower)
        }
    })
    return collided
}

function Progress(){
    this.element = newElement('span', 'score')
    this.updateScore = score => {
        this.element.innerHTML = score
    }
    this.updateScore(0)
}

function GameOver() {
    this.element = newElement('div', 'game-over')

    this.element.innerHTML = 'Game Over'
    this.hide = () => {
        this.element.style.display = 'none'
    }
    this.show = () => {
        this.element.style.display = 'block'
    }
}

function RestartCountdown(seconds) {
    this.element = newElement('div', 'restart-countdown')
    this.updateText = (text) => {
        this.element.innerHTML = text
    }

    const countdownInterval = setInterval(() => {
        this.updateText(`Restart em: ${seconds} segundos`)
        this.element.style.display = 'none'
        
        seconds--

        if (seconds <= 0) {
            clearInterval(countdownInterval);
            this.updateText('Restart: 0 seconds')
            this.element.style.display = 'none'
            window.location.reload()
        } else {
            this.element.style.display = 'block'
            this.updateText(`Restart: ${seconds} seconds`)
        }
    }, 1000)
}

function FlappyDogGame(){    
    let score = 0
    let gameover = false

    const gameArea = document.querySelector('[flappy-dog]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const barriers = new Barriers(height, width, 200, 400, () => progress.updateScore(++score))
    const flappyDog = new FlappyDog(height)
    const gameOverMessage = new GameOver();
    


    gameArea.appendChild(progress.element)
    gameArea.appendChild(flappyDog.element)
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))
    gameArea.appendChild(gameOverMessage.element)
    


    gameOverMessage.hide()

    this.start = () => {
        const timer = setInterval(() => {
            barriers.animate()
            flappyDog.animate()

            if(collided(flappyDog, barriers)){

                const restartCountdown = new RestartCountdown(3, () => window.location.reload())
                gameArea.appendChild(restartCountdown.element)


                clearInterval(timer)
                
                gameover = true
                gameOverMessage.show()
                restartCountdown.updateText('Restart: 3 seconds')
            }
        }, 20)
    }
}

new FlappyDogGame().start()