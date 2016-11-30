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
// Initial implementation by Ben Alkov 20-27 November 2016

'use strict'

const TAU = Math.PI * 2,
    Width = window.innerWidth,
    Height = window.innerHeight,
    Grey = new THREE.Color(0x585d6e),  // 0x585d6e
    Blue = new THREE.Color(0x0000cc),  // 0x0000cc
    Green = new THREE.Color(0x71bc00),  // 0x71bc00
    // (val, min, max) Clamps the value to be between min and max.
    clamp = THREE.Math.clamp,
    // ( x, a1, a2, b1, b2 ) Linear mapping of x from range [a1, a2] to range [b1, b2]
    map = THREE.Math.mapLinear,
    degToRad = THREE.Math.degToRad,
    radToDeg = THREE.Math.radToDeg,
    // (low, high) Random integer from low to high interval.
    randInt = THREE.Math.randInt,
    // (low, high) Random float from low to high interval.
    randFloat = THREE.Math.randFloat,
    // (range) Random float from -range / 2 to range / 2 interval.
    randFloatSpread = THREE.Math.randFloatSpread

let scene,
    camera,
    renderer,
    rects = []

let requestAnimationFrame = window.requestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.msRequestAnimationFrame
window.requestAnimationFrame = requestAnimationFrame

class Rect {

    constructor(ident) {
        this.size = Math.floor(randFloat(Width / 80, Width / 132))
        this.position = Rect.positionOnOrbit()
        this.angle = this.getAngle()
        this.rotation = new THREE.Euler(0, 0, randFloat(0, TAU))
        // ~0.2 to ~0.1 degree
        this.orbitAngularSpeed = avoidZero(3.49e-3, 1.745e-3)
        // ~1.5 to ~0.3 degree
        this.objectAngularSpeed = avoidZero(2.618e-2, 5.236e-3)
        this.planeGeometry = new THREE.PlaneGeometry(this.size, this.size)
        // Or WireframeGeometry(geo) to render all edges
        this.outlineGeometry = new THREE.EdgesGeometry(this.planeGeometry)
        this.planeMaterial = new THREE.MeshBasicMaterial({
            'transparent': true,
            'opacity': 0.35
        })
        this.outlineMaterial = new THREE.LineBasicMaterial({
            'transparent': true,
            'opacity': 0.65,
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
            this.planeMaterial.color.lerp(Blue,
                this.angle % 1 + lodash.random(0.05, 0.1))
            this.outlineMaterial.color.lerp(Blue,
                this.angle % 1 + lodash.random(0.05, 0.1))
        }
        else {
            this.planeMaterial.color.lerp(Green,
                this.angle % 1 + lodash.random(0.05, 0.1))
            this.outlineMaterial.color.lerp(Green,
                this.angle % 1 + lodash.random(0.05, 0.1))
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
            angle = randFloat(0, TAU),
            // Slightly offsets the position so we don't end up with the
            // visible rects orbiting on *exact* circles.
            radius = Rect.chooseOrbit() + randFloat(0, Width / 64),
            creationX = Math.cos(angle) * radius,
            creationY = Math.sin(angle) * radius
        position =  new THREE.Vector3(creationX, creationY, 0)
        return position
    }
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function isWebglAvailable() {
    // e.g.
    // renderer = isWebglAvailable() ?
    //            new THREE.WebGLRenderer({'antialias': true}) :
    //            console.log('Sorry! WebGL required')
    try {
        let canvas = document.createElement('canvas')
        return !!window.WebGLRenderingContext &&
            canvas.getContext('webgl')
    }
    catch (e) {
        return false
    }
}

function init() {
    scene = new THREE.Scene()
    renderer = isWebglAvailable() ?
               new THREE.WebGLRenderer({'antialias': true}) :
               console.log('Sorry! WebGL required')
    camera = new THREE.PerspectiveCamera(
        50,  // F.O.V
        Width / Height,  // Aspect
        0.1,  // Near clip
        10000  // Far clip
    )
    camera.position.z = 150
    renderer.setSize(Width, Height)
    renderer.setClearColor(Grey, 1.0)
    document.body.appendChild(renderer.domElement)
    window.addEventListener('resize', onWindowResize, false)
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


init()
setup()
animate()
