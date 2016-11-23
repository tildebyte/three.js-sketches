'use strict';
window.THREE = THREE
window.lodash = _
const TAU = Math.PI * 2
const Width = window.innerWidth
const Height = window.innerHeight
const Grey = hslColor(226, 0.11, 0.39)  // 0x595E6E
const Blue = hslColor(240, 1.0, 0.4)  // 0x595E6E
const Green = hslColor(84, 1.0, 0.37)  // 0x595E6E
let scene
let camera
let renderer
let rects = []

class Rect {

    constructor(color) {
        this.color = color
        this.size = toInt(lodash.random(Width / 16, Width / 25, 'float'))
        this.position = Rect.positionOnOrbit()
        this.rotation = new THREE.Euler(0, 0, lodash.random(TAU))
        this.orbitAngularSpeed = avoidZero(0.5, 0.01)
        this.objectAngularSpeed = avoidZero(0.1, 0.005)
        this.planeGeometry = new THREE.PlaneGeometry(this.size, this.size)
        // Or WireframeGeometry(geo) to render all edges
        this.outlineGeometry = new THREE.EdgesGeometry(this.planeGeometry)
        this.planeMaterial = new THREE.MeshBasicMaterial({
            'color': this.color,
            'transparent': true,
            'opacity': 0.4
        })
        this.outlineMaterial = new THREE.LineBasicMaterial({
            'color': this.color,
            'transparent': true,
            'opacity': 0.75,
            'linewidth': 2
        })
        this.planeMesh = new THREE.Mesh(this.planeGeometry, this.planeMaterial)
        this.outlineMesh = new THREE.LineSegments(this.outlineGeometry, this.outlineMaterial)
        this.planeMesh.position.copy(this.position)
        this.outlineMesh.position.copy(this.planeMesh.position)
        this.planeMesh.rotation.copy(this.rotation)
        this.outlineMesh.rotation.copy(this.planeMesh.rotation)
    }

    getObjects() {
        return [this.planeMesh, this.outlineMesh]
    }

    orbit() {
        let x = this.planeMesh.position.x
        let y = this.planeMesh.position.y
        let theta = this.orbitAngularSpeed
        this.planeMesh.position.x = x * Math.cos(theta) + y * Math.sin(theta)
        this.planeMesh.position.y = y * Math.cos(theta) - x * Math.sin(theta)
        this.outlineMesh.position.copy(this.planeMesh.position)
    }

    rotate() {
        this.rotation.z += this.objectAngularSpeed
        this.planeMesh.rotation.z = this.rotation.z
        this.outlineMesh.rotation.z = this.planeMesh.rotation.z
    }

    static chooseOrbit() {
        // Randomly choose an orbit, based on a set of weights.
        // The returns can be adjusted to account for a larger / smaller sketch size.
        let orbit
        let chance = Math.random()
        if (chance < 0.18) {
            orbit = Width / 8
        }
        else if (chance < 0.50) {
            orbit = Width / 4
        }
        else if (chance < 0.78) {
            orbit = Width / 2.46
        }
        else if (chance < 1.0) {
            orbit = Width / 1.7777
        }
        return orbit
    }

    static positionOnOrbit() {
        let centerX = Width / 2
        let centerY = Height / 2
        let position
        // Generate a random position on the circumference of the orbit chosen for
        // this item.
        let angle = lodash.random(TAU)
        // `randint` slightly offsets the position so we don't end up with the
        // visible rects orbiting on *exact* circles.
        let radius = Rect.chooseOrbit() + lodash.random(Width / 23)
        let creationX = centerX + Math.cos(angle) * radius
        let creationY = centerY + Math.sin(angle) * radius
        position =  new THREE.Vector3(creationX, creationY, 0)
        return position
    }
}

function toInt(val) {
    return Math.round(val)
}

// Return a value from a given range, which avoids zero, within a given tolerance.
function avoidZero(range, tolerance) {
    //    Return a random value in the range from `-range` to strictly less than
    //    `range`, excluding the inner range +/-`tolerance` (and, logically, zero as
    //    well).
    let value = lodash.random(-range, range, 'float')
    while (-tolerance < value && value < tolerance) {
        value = lodash.random(-range, range, 'float')
    }
    return value
}

function hslColor(h, s, l) {
    let color
    h = h / 360  // Map to 0..1
    color = new THREE.Color(0)
    color.setHSL(h, s, l)
    return color
}

function init() {
    scene = new THREE.Scene()
    renderer = new THREE.WebGLRenderer({ antialias: true })
    camera = new THREE.PerspectiveCamera(
        50,  // F.O.V
        Width / Height,  // Aspect
        0.1,  // Near clip
        1000  // Far clip
    )
    camera.position.set(Width / 2, Height / 2, Width * 1.15)
    renderer.setSize(Width, Height)
    renderer.setClearColor(Grey, 1)
    document.body.appendChild(renderer.domElement)
}

function setup() {

    for (let i of lodash.range(100)) {
        rects[i] = new Rect(Blue)
    }
    for (let rect of rects) {
        let objs
        objs = rect.getObjects()
        scene.add(objs[0])
        scene.add(objs[1])
    }
}

function update() {
    for (let rect of rects) {
        rect.rotate()
        // rect.orbit()
    }
}

init()
setup()

let animate = function() {
    requestAnimationFrame(animate)
    update()
    renderer.render(scene, camera)
}

window.scene = scene
animate()
