const canvas_background_color = "rgba(0, 0, 0, 0.1)"
const player_color = "white"
const player_radius = 10
const player_bomb_color = "white"
const player_bomb_radius = 5
const start_color = "white"
const friction = 1
const total_no_of_star = 500

let start_sound
let blast_sound
let shoot_sound
let over_sound


let animation_id
let point = 0

const start_btn = document.querySelector(".start")
const restart_btn = document.querySelector(".restart")

const canvas = document.getElementById("canvas")
const canvas_ctx = canvas.getContext("2d")
canvas.height = innerHeight
canvas.width = innerWidth
const canvas_center_x = canvas.width / 2
const canvas_center_y = canvas.height / 2

document.addEventListener('contextmenu', event => event.preventDefault());


start_sound = new Howl({
    src: ['sound/music.mp3'],
    html5: true,
    loop: true,
    buffer: true,
loop:
    volume: 0.6
})

class Player {
    constructor(x, y, radius, start_angle, end_angle) {
        this.x = x
        this.y = y
        this.radius = radius
        this.start_angle = start_angle
        this.end_angle = end_angle
    }

    draw() {
        canvas_ctx.fillStyle = player_color
        canvas_ctx.beginPath()
        canvas_ctx.arc(this.x, this.y, this.radius, this.start_angle, this.end_angle, false)
        canvas_ctx.fill()
    }
}

class Bomb {
    constructor(x, y, radius, start_angle, end_angle, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.start_angle = start_angle
        this.end_angle = end_angle
        this.velocity = velocity
    }

    draw() {
        canvas_ctx.fillStyle = player_bomb_color
        canvas_ctx.beginPath()
        canvas_ctx.arc(this.x, this.y, this.radius, this.start_angle, this.end_angle, false)
        canvas_ctx.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, start_angle, end_angle, velocity, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.start_angle = start_angle
        this.end_angle = end_angle
        this.velocity = velocity
        this.color = color
    }

    draw() {
        canvas_ctx.fillStyle = this.color
        canvas_ctx.beginPath()
        canvas_ctx.arc(this.x, this.y, this.radius, this.start_angle, this.end_angle, false)
        canvas_ctx.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Blast {
    constructor(x, y, radius, start_angle, end_angle, velocity, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.start_angle = start_angle
        this.end_angle = end_angle
        this.velocity = velocity
        this.color = color
        this.alpha = 1
    }

    draw() {
        canvas_ctx.save()
        canvas_ctx.globalAlpha = this.alpha
        canvas_ctx.fillStyle = this.color
        canvas_ctx.beginPath()
        canvas_ctx.arc(this.x, this.y, this.radius, this.start_angle, this.end_angle, false)
        canvas_ctx.fill()
        canvas_ctx.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

class Star {
    constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.radius = Math.random() * 2
        this.start_angle = 0
        this.end_angle = 360
        this.color = start_color
        this.alpha = 0.3
    }

    draw() {
        canvas_ctx.save()
        canvas_ctx.globalAlpha = this.alpha
        canvas_ctx.fillStyle = this.color
        canvas_ctx.beginPath()
        canvas_ctx.arc(this.x, this.y, this.radius, this.start_angle, this.end_angle, false)
        canvas_ctx.fill()
        canvas_ctx.restore()
    }

    update() {
        this.draw()
        this.alpha -= 0.01
    }
}

function play() {
    start_sound.play()
}

function pause() {
    start_sound.pause()
}

let player = new Player(canvas_center_x, canvas_center_y, player_radius, 0, Math.PI * 2)
let star = new Star()
let bombs = []
let enemies = []
let blasts = []
let stars = []

for (let i = 0; i < total_no_of_star; i++) {
    stars.push(new Star())
}

//start game
start_btn.addEventListener("click", (e) => {
    play()
    drawEnemies()
    start_btn.style.display = "none"
})

//aming enemy and shooting
addEventListener("click", (e) => {
    new Howl({
        src: ['sound/shoot.mp3'],
        buffer: true,
    }).play()
    const angle = Math.atan2(e.clientY - canvas_center_y, e.clientX - canvas_center_x)
    bombs.push(
        new Bomb(
            canvas_center_x,
            canvas_center_y,
            player_bomb_radius,
            0,
            Math.PI * 2, {
                x: Math.cos(angle) * 5,
                y: Math.sin(angle) * 5
            })
    )
})

//restarting the game
restart_btn.addEventListener("click", (e) => {
    play()
    document.querySelector(".card").style.display = "none"
    point = 0;
    updateScore(point)
    setTimeout(() => {
        init()
        for (let i = 0; i < total_no_of_star; i++) {
            stars.push(new Star())
        }
        resetCanvas()
        player.draw()
        shootBomb()
    }, 0)
})

function init() {
    player = new Player(canvas_center_x, canvas_center_y, player_radius, 0, Math.PI * 2)
    let star = new Star()
    bombs = []
    enemies = []
    blasts = []
    stars = []
}

startGame()

function startGame() {
    resetCanvas()
    player.draw()
    shootBomb()
}

function resetCanvas() {
    canvas_ctx.fillStyle = canvas_background_color
    canvas_ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 10) + 10
        let x, y

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const angle = Math.atan2(canvas_center_y - y, canvas_center_x - x)
        enemies.push(
            new Enemy(
                x,
                y,
                radius,
                0,
                Math.PI * 2, {
                    x: Math.cos(angle),
                    y: Math.sin(angle)
                },
                `hsl(${Math.random() * 360}, 50%, 50%)`
            )
        )
    }, 1000)
}

function shootBomb() {
    animation_id = requestAnimationFrame(shootBomb)
    resetCanvas()
    stars.forEach((star, start_index) => {
        if (star.alpha <= 0) {
            stars.splice(start_index, 1)
            stars.push(new Star())
        } else {
            star.update()
        }
    })
    player.draw()
        //doing explosion
    blasts.forEach((blast, blast_index) => {
        if (blast.alpha <= 0) {
            blasts.splice(blast_index, 1)
        } else {
            blast.update()
        }
    })
    bombs.forEach((bomb, bomb_index) => {
        bomb.update()
            //removing bomb after it goes offscreen
        if (bomb.x + bomb.radius < 0 ||
            bomb.x - bomb.radius > canvas.width ||
            bomb.y + bomb.radius < 0 ||
            bomb.y - bomb.radius > canvas.height) {
            bombs.splice(bomb_index, 1)
        }
    })
    enemies.forEach((enemy, enemy_index) => {
        const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y)
            //aaagh, you lost the game
        if (distance - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animation_id)

            showScoreCard(point)
        }
        enemy.update()
        bombs.forEach((bomb, bomb_index) => {
            const distance = Math.hypot(bomb.x - enemy.x, bomb.y - enemy.y)

            //bombs hits the enemy
            if (distance - enemy.radius - bomb.radius < 1) {

                //creating explosion
                for (let i = 0; i < enemy.radius * 2; i++) {
                    blasts.push(
                        new Blast(
                            bomb.x,
                            bomb.y,
                            Math.random() * 2,
                            0,
                            Math.PI * 2, {
                                x: (Math.random() - 0.5) * (Math.random() * 6),
                                y: (Math.random() - 0.5) * (Math.random() * 6)
                            },
                            enemy.color
                        ))
                }
                if (enemy.radius - 10 > 5) {
                    //updating score 
                    point += 100
                    updateScore(point)

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    enemy.radius -= 10
                } else {
                    //increasing score 
                    point += 250
                    updateScore(point)
                    enemies.splice(enemy_index, 1)
                }

                bombs.splice(bomb_index, 1)
            }
        })
    })
}

function updateScore(point) {
    new Howl({
        src: ['sound/blast.mp3'],
        volume: 1,
        buffer: true,
    }).play()
    document.getElementById("scorebard").innerHTML = `Score: ${point}`
}

function showScoreCard(point) {
    new Howl({
        src: ['sound/over.mp3'],
        volume: 1,
        buffer: true,
    }).play()
    pause()
    document.querySelector(".card").style.display = "block"
    document.getElementById("finalScore").innerHTML = point
}
