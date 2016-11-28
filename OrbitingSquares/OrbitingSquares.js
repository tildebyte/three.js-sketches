// 1. One hundred squares
// 2. Of randomly-selected size
// 3. Each having semi-tranparent fill and stroke
// 4. Each colored according to an underlying algorithm
// 5. Each rotating around its own center with a randomly-selected speed and
//    direction
// 6. Randomly distributed around the circumference of
// 7. One of several concentric circles
// 8. All squares rotating at a randomly-selected speed and direction around
//    a common center point
//
// Initial implementation by Ben Alkov 23-27 November 2016

'use strict'

window.THREE = THREE
window.lodash = _
const TAU = Math.PI * 2,
    Width = window.innerWidth,
    Height = window.innerHeight,
    Grey = hlsColor(226, 0.39, 0.11),  // 0x585d6e
    Blue = hlsColor(240, 0.40, 1.0),  // 0x0000cc
    Green = hlsColor(84, 0.33, 0.8)  // 0x71bc00
let scene,
    camera,
    renderer,
    rects = []

class Rect {

    constructor() {
        this.size = toInt(lodash.random(Width / 80, Width / 132, 'float'))
        this.position = Rect.positionOnOrbit()
        this.angle = this.getAngle()
        this.rotation = new THREE.Euler(0, 0, lodash.random(TAU))
        // ~0.5 to ~0.1 degree
        this.orbitAngularSpeed = avoidZero(8.727e-3, 1.745e-3)
        // ~3 to ~0.3 degree
        this.objectAngularSpeed = avoidZero(5.236e-2, 5.236e-3)
        this.planeGeometry = new THREE.PlaneGeometry(this.size, this.size)
        // Or WireframeGeometry(geo) to render all edges
        this.outlineGeometry = new THREE.EdgesGeometry(this.planeGeometry)
        this.planeMaterial = new THREE.MeshBasicMaterial({
            'transparent': true,
            'opacity': 0.4
        })
        this.outlineMaterial = new THREE.LineBasicMaterial({
            'transparent': true,
            'opacity': 0.75,
            'linewidth': 2
        })
        this.planeMesh = new THREE.Mesh(this.planeGeometry, this.planeMaterial)
        this.outlineMesh = new THREE.LineSegments(this.outlineGeometry,
                                                  this.outlineMaterial)
        this.planeMesh.position.copy(this.position)
        this.planeMesh.rotation.copy(this.rotation)
        this.planeMesh.add(this.outlineMesh)
        this.recolor()
    }

    getMeshObject() {
        return this.planeMesh
    }

    getAngle() {
        let position
        position = new THREE.Vector2(this.position.x, this.position.y)
        return position.angle()
    }

    orbit() {
        let x = this.position.x,
            y = this.position.y,
            theta = this.orbitAngularSpeed
        this.position.x = x * Math.cos(theta) + y * Math.sin(theta)
        this.position.y = y * Math.cos(theta) - x * Math.sin(theta)
        this.planeMesh.position.copy(this.position)
        this.angle = this.getAngle()
    }

    rotate() {
        this.rotation.z += this.objectAngularSpeed
        this.planeMesh.rotation.z = this.rotation.z
    }

    recolor() {
        if (Math.floor(this.angle) % 2) {
            this.planeMaterial.color.lerp(Blue, this.angle % 1 + lodash.random(0.05, 0.1))
            this.outlineMaterial.color.lerp(Blue, this.angle % 1 + lodash.random(0.05, 0.1))
        }
        else {
            this.planeMaterial.color.lerp(Green, this.angle % 1 + lodash.random(0.05, 0.1))
            this.outlineMaterial.color.lerp(Green, this.angle % 1 + lodash.random(0.05, 0.1))
        }
    }

    static chooseOrbit() {
        // Randomly choose an orbit, based on a set of weights.
        // The returns can be adjusted to account for a larger / smaller sketch size.
        let chance = Math.random(),
            orbit
        if (chance < 0.18) {
            orbit = Width / 41
        }
        else if (chance < 0.50) {
            orbit = Width / 17
        }
        else if (chance < 0.78) {
            orbit = Width / 12
        }
        else if (chance < 1.0) {
            orbit = Width / 9
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
        rects[_] = new Rect()
        scene.add(rects[_].getMeshObject())
    }
}

function update() {
    for (let rect of rects) {
        rect.rotate()
        rect.orbit()
        rect.recolor()
    }
}

function animate() {
    requestAnimationFrame(animate)
    update()
    renderer.render(scene, camera)
}

window.scene = scene
init()
setup()
animate()
