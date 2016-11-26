'use strict'

// Debug
let THREE,
    lodash,
    _,
    hslColor,
    toInt,
    avoidZero

window.THREE = THREE
window.lodash = _
const TAU = Math.PI * 2,
    Width = window.innerWidth,
    Height = window.innerHeight,
    Grey = hslColor(226, 0.11, 0.39),  // 0x595E6E
    Blue = hslColor(240, 1.0, 0.4),  // 0x595E6E
    Green = hslColor(84, 1.0, 0.37)  // 0x595E6E
let scene,
    camera,
    renderer,
    rects = []

class Rect {

    constructor(color) {
        this.color = color
        this.size = toInt(lodash.random(Width / 80, Width / 132, 'float'))
        this.position = Rect.positionOnOrbit()
        this.rotation = new THREE.Euler(0, 0, lodash.random(TAU))
        this.orbitAngularSpeed = avoidZero(0.015, 0.001)
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
        this.outlineMesh = new THREE.LineSegments(this.outlineGeometry,
                                                  this.outlineMaterial)
        this.planeMesh.position.copy(this.position)
        // this.outlineMesh.position.copy(this.planeMesh.position)
        this.planeMesh.rotation.copy(this.rotation)
        this.planeMesh.add(this.outlineMesh)
        // this.outlineMesh.rotation.copy(this.planeMesh.rotation)
    }

    getMeshObjects() {
        return this.planeMesh
    }

    orbit() {
        let x = this.planeMesh.position.x,
            y = this.planeMesh.position.y,
            theta = this.orbitAngularSpeed
        this.planeMesh.position.x = x * Math.cos(theta) + y * Math.sin(theta)
        this.planeMesh.position.y = y * Math.cos(theta) - x * Math.sin(theta)
        // this.outlineMesh.position.copy(this.planeMesh.position)
    }

    rotate() {
        this.rotation.z += this.objectAngularSpeed
        this.planeMesh.rotation.z = this.rotation.z
        // this.outlineMesh.rotation.z = this.planeMesh.rotation.z
    }

    static chooseOrbit() {
        // Randomly choose an orbit, based on a set of weights.
        // The returns can be adjusted to account for a larger / smaller sketch size.
        let chance = Math.random(),
            orbit
        if (chance < 0.18) {
            orbit = Width / 40
        }
        else if (chance < 0.50) {
            orbit = Width / 19
        }
        else if (chance < 0.78) {
            orbit = Width / 10
        }
        else if (chance < 1.0) {
            orbit = Width / 7
        }
        return orbit
    }

    static positionOnOrbit() {
        let position,
            // Generate a random position on the circumference of the orbit chosen for
            // this item.
            angle = lodash.random(TAU),
            // Slightly offsets the position so we don't end up with the
            // visible rects orbiting on *exact* circles.
            radius = Rect.chooseOrbit() + lodash.random(Width / 64),
            creationX = Math.cos(angle) * radius,
            creationY = Math.sin(angle) * radius
        position =  new THREE.Vector3(creationX, creationY, 0)
        return position
    }
}

function init() {
    scene = new THREE.Scene()
    renderer = new THREE.WebGLRenderer({'antialias': true})
    camera = new THREE.PerspectiveCamera(
        50,  // F.O.V
        Width / Height,  // Aspect
        0.1,  // Near clip
        10000  // Far clip
    )
    camera.position.z = 150
    renderer.setSize(Width, Height)
    renderer.setClearColor(Grey, 1)
    document.body.appendChild(renderer.domElement)
}

function setup() {
    for (let _ of lodash.range(100)) {
        rects[_] = new Rect(Blue)
    }
    for (let rect of rects) {
        let objs
        objs = rect.getMeshObjects()
        scene.add(objs)
    }
}

init()
setup()

function update() {
    for (let rect of rects) {
        rect.rotate()
        rect.orbit()
    }
}

function animate() {
    requestAnimationFrame(animate)
    update()
    renderer.render(scene, camera)
}

window.scene = scene
animate()
