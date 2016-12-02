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
// Initial implementation by Ben Alkov 20-27 November 2016.

'use strict'

const TAU = Math.PI * 2,
    Width = window.innerWidth,
    Height = window.innerHeight,
    Grey = new THREE.Color(0x46474C),  // 0x585d6e
    Blue = new THREE.Color(0x2525C4),  // 0x0000cc
    Green = new THREE.Color(0x7DB528),  // 0x71bc00
    // ( x, a1, a2, b1, b2 ) - Linear mapping of x from range [a1, a2] to range [b1, b2].
    map = THREE.Math.mapLinear,
    degToRad = THREE.Math.degToRad,
    radToDeg = THREE.Math.radToDeg,
    // (low, high) Random integer from low to high interval.
    randInt = THREE.Math.randInt,
    // (low, high) Random float from low to high interval.
    randFloat = THREE.Math.randFloat

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
    constructor() {
        this.size = randFloat(0.75, 1.5)
        this.position = Rect.positionOnOrbit()
        this.angle = this.getAngle()
        this.rotation = new THREE.Euler(0, 0, randFloat(0, TAU))
        // [-0.19, 0.19] within 0.03 degree of 0.
        this.orbitAngularSpeed = avoidZero(0.19, 0.03)
        // [-1.5, 1.5] within 0.3 degree of 0.
        this.objectAngularSpeed = avoidZero(1.5, 0.3)
        this.planeGeometry = new THREE.PlaneGeometry(this.size, this.size)
        // Or WireframeGeometry(geo) to render all edges.
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
            theta = degToRad(this.orbitAngularSpeed)
        this.position.x = x * Math.cos(theta) + y * Math.sin(theta)
        this.position.y = y * Math.cos(theta) - x * Math.sin(theta)
        this.planeMesh.position.copy(this.position)
        this.angle = this.getAngle()
    }

    rotate() {
        this.rotation.z += degToRad(this.objectAngularSpeed)
        this.planeMesh.rotation.z = this.rotation.z
    }

    recolor() {
        // This looks weird because, AFAICT, lerping with a var of type `Color`
        //     **overwrites** the var with the new `Color` value (as well as
        //     changing the color being lerped, as expected). I'm working around
        //     this by always creating entirely new `Color` vars each time. Which
        //     is probably overkill.
        let color,
            otherColor,
            shade
        // Left half.
        if (degToRad(90) <= this.angle && this.angle <= degToRad(270)) {
            // 2nd quad.
            if (degToRad(90) <= this.angle && this.angle <= degToRad(180)) {
                shade = map(radToDeg(this.angle), 180, 90, 0, 0.5)
            }
            // 3rd quad.
            else if (degToRad(180) < this.angle && this.angle <= degToRad(270)) {
                shade = map(radToDeg(this.angle), 180, 270, 0, 0.5)
            }
            color = new THREE.Color(Green)
            otherColor = new THREE.Color(Blue)
        }
        // Right half.
        else {
            // 1st quad.
            if (degToRad(0) <= this.angle && this.angle < degToRad(90)) {
                shade = map(radToDeg(this.angle), 0, 89.99, 0, 0.5)
            }
            // 4th quad.
            else if (degToRad(270) < this.angle && this.angle <= degToRad(360)) {
                shade = map(radToDeg(this.angle), 360, 269.99, 0, 0.5)
            }
            color = new THREE.Color(Blue)
            otherColor = new THREE.Color(Green)
        }

        this.planeMaterial.color = color
        this.planeMaterial.color.lerp(new THREE.Color(otherColor),
                                      shade + randFloat(-0.02, 0.02))
        this.outlineMaterial.color = this.planeMaterial.color
    }

    static chooseOrbit() {
        // Randomly choose an orbit, based on a set of weights.
        // Tweak the orbits by adjusting the divisors.
        let chance = Math.random(),
            orbit
        if (chance < 0.18) {
            orbit = 3
        }
        else if (chance < 0.50) {
            orbit = 6
        }
        else if (chance < 0.78) {
            orbit = 9
        }
        else if (chance < 1.0) {
            orbit = 12
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
            radius = Rect.chooseOrbit() + randFloat(0, 3),
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
        50,  // F.O.V.
        Width / Height,  // Aspect.
        0.1,  // Near clip.
        10000  // Far clip.
    )
    camera.position.z = 30
    renderer.setPixelRatio(window.devicePixelRatio)
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
