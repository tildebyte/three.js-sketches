/*
    A wireframe box with colored edges which expands and contracts according
    to time-of-day.
    An original implementation of *hms* from http://www.gysin-vanetti.com/hms
    (C) Ben Alkov, 2014, licensed as APL 2.0 as part of processing.py
    (https://github.com/jdf/processing.py).
*/

'use strict'

const TAU = Math.PI * 2,
    Width = window.innerWidth,
    Height = window.innerHeight,
    // (x, a1, a2, b1, b2)
    map = THREE.Math.mapLinear,
    // (x, y, t)
    lerp = THREE.Math.lerp,
    // (value, min, max)
    clamp = THREE.Math.clamp,
    // (x, min, max)
    // Returns the percentage (0-1) that x has moved between min and max,
    // with easing in to/out of min and max.
    smoothstep = THREE.Math.smoothstep,
    degToRad = THREE.Math.degToRad,
    radToDeg = THREE.Math.radToDeg,
    // (low, high) Random integer from low to high interval.
    randInt = THREE.Math.randInt,
    // (low, high) Random float from low to high interval.
    randFloat = THREE.Math.randFloat,
    randFLoatSpread = THREE.Math.randFloatSpread

let scene,
    camera,
    renderer,
    boxClock,
    Red = new THREE.Color('rgb(255, 137, 95)'),
    Green = new THREE.Color('rgb(176, 255, 121)'),
    Blue = new THREE.Color('rgb(56, 76, 204)')

let requestAnimationFrame = window.requestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.msRequestAnimationFrame
window.requestAnimationFrame = requestAnimationFrame


class Box {
    constructor() {
        // Draw a 2x2x2 transparent cube with edges colored according to the
        // current time.
        // Seconds - lines along local `x`: Red
        // Minutes - lines along local `y`: Green
        // Hours - lines along local `z`: Blue

        this.size = 12
        this.tick = 0.008
        this.boxGeometry = new THREE.BoxGeometry(this.size, this.size, this.size)
        this.wireGeometry = new THREE.EdgesGeometry(this.boxGeometry)
        this.boxMaterial = new THREE.MeshBasicMaterial({
            'color': 0x0a0a0a
            // 'transparent': true,
            // 'opacity': 0
        })
        this.wireMaterial = new THREE.LineBasicMaterial({
            'color': Blue,
            // 'transparent': true,
            // 'opacity': 0.65,
            'linewidth': 4
        })
        this.boxMesh = new THREE.Mesh(this.boxGeometry, this.boxMaterial)
        this.wireMesh = new THREE.LineSegments(this.wireGeometry,
                                                  this.wireMaterial)
        this.boxMesh.add(this.wireMesh)
        // Offset edges so as to deal with face/edge clashing.
        this.wireMesh.scale.x += 0.01
        this.wireMesh.scale.y += 0.01
        this.wireMesh.scale.z += 0.01
        this.scale()
    }

    getMeshObject() {
        return this.boxMesh
    }

    rotate() {
        this.boxMesh.rotation.x += this.tick
        this.boxMesh.rotation.y += this.tick
        this.boxMesh.rotation.z += this.tick
    }

    scale() {
        this.boxMesh.scale.x = map(new Date().getSeconds(), 0, 59, 1, 12)
        this.boxMesh.scale.y = map(new Date().getMinutes(), 0, 59, 1, 12)
        this.boxMesh.scale.z = map(new Date().getHours(), 0, 23, 1, 12)
    }
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}


function webglAvailable() {
		try {
			let canvas = document.createElement('canvas')
			return !!(window.WebGLRenderingContext &&
                    canvas.getContext('webgl'))
		}
        catch (e) {
			return false
		}
	}

	if (webglAvailable()) {
		renderer = new THREE.WebGLRenderer()
	}
    else {
        let container
        container = document.createElement('div')
        document.body.appendChild(container)
        let info = document.createElement('div')
        info.style.position = 'absolute'
        info.style.top = '10px'
        info.style.width = '100%'
        info.style.fontSize = '28px'
        info.style.textAlign = 'center'
        info.innerHTML = 'Sorry! WebGL required.'
        container.appendChild(info)
        requestAnimationFrame(animate)
	}


function init() {
    scene = new THREE.Scene()
    webglAvailable()
    camera = new THREE.PerspectiveCamera(
        50,  // F.O.V.
        Width / Height,  // Aspect.
        0.1,  // Near clip.
        10000  // Far clip.
    )
    camera.position.z = 400
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(Width, Height)
    renderer.setClearColor(0x0a0a0a, 1.0)
    document.body.appendChild(renderer.domElement)
    window.addEventListener('resize', onWindowResize, false)
}


function setup() {
    boxClock = new Box()
    scene.add(boxClock.getMeshObject())
}


function update() {
    boxClock.rotate()
    boxClock.scale()
}


function animate() {
    requestAnimationFrame(animate)
    update()
    renderer.render(scene, camera)
}


init()
setup()
animate()
