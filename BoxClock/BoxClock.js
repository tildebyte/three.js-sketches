/*
    A wireframe box with colored edges which expands and contracts according
    to time-of-day.
    An original implementation of *hms* from http://www.gysin-vanetti.com/hms
    (C) Ben Alkov, 2016, licensed as.
*/

'use strict'

const TAU = Math.PI * 2,
    Width = window.innerWidth,
    Height = window.innerHeight,
    // (x, a1, a2, b1, b2)
    map = THREE.Math.mapLinear,
    RED = new THREE.Color('rgb(255, 137, 95)'),
    GREEN = new THREE.Color('rgb(176, 255, 121)'),
    BLUE = new THREE.Color('rgb(56, 76, 204)'),
    BACKGROUND = new THREE.Color('rgb(10, 10, 10)')

let scene,
    camera,
    renderer,
    data,
    box = new THREE.Object3D()

let requestAnimationFrame = window.requestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.msRequestAnimationFrame
window.requestAnimationFrame = requestAnimationFrame

data = {
    // Seconds - lines along `x`.
    'seconds': {
        'verts': [[-1, 1, 1],
                  [1, 1, 1],
                  [-1, -1, 1],
                  [1, -1, 1],
                  [-1, -1, -1],
                  [1, -1, -1],
                  [-1, 1, -1],
                  [1, 1, -1]],
        'color': RED
    },
    // Minutes - lines along `y`.
    'minutes': {
        'verts': [[-1, 1, 1],
                  [-1, -1, 1],
                  [1, 1, 1],
                  [1, -1, 1],
                  [1, 1, -1],
                  [1, -1, -1],
                  [-1, 1, -1],
                  [-1, -1, -1]],
        'color': GREEN
    },
    // Hours - lines along `z`.
    'hours': {
        'verts': [[-1, 1, -1],
                  [-1, 1, 1],
                  [1, 1, -1],
                  [1, 1, 1],
                  [1, -1, -1],
                  [1, -1, 1],
                  [-1, -1, -1],
                  [-1, -1, 1]],
        'color': BLUE
    }
}


class Edges {
    constructor(record) {
        let geometry = new THREE.Geometry(),
            material = new THREE.LineBasicMaterial()
            this.record = record
            this.verts = this.record['verts']

        for (let vert of this.verts) {
            geometry.vertices.push(new THREE.Vector3().fromArray(vert))
        }
        material = new THREE.LineBasicMaterial({'color': this.record['color']})
        this.linesMesh = new THREE.LineSegments(geometry, material)
    }

    getMeshObject() {
        return this.linesMesh
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
		renderer = new THREE.WebGLRenderer({'antialias': true})
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
    camera.position.z = 75
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(Width, Height)
    renderer.setClearColor(BACKGROUND, 1.0)
    document.body.appendChild(renderer.domElement)
    window.addEventListener('resize', onWindowResize, false)
}


function setup() {
    // Draw a 2x2x2 transparent cube with edges colored according to the
    // current time.
    // Seconds - lines along local `x`: Red
    // Minutes - lines along local `y`: Green
    // Hours - lines along local `z`: Blue
    box.material = new THREE.MeshBasicMaterial({'color': BLUE})
    for (let key in data) {
        if (!data.hasOwnProperty(key)) {continue}
        let record = data[key]
        box.add(new Edges(record).getMeshObject())
    }
    scene.add(box)
}


function update() {
    let tick = 0.008,
        s = map(new Date().getSeconds(), 0, 59, 1, 12),
        m = map(new Date().getMinutes(), 0, 59, 1, 12),
        h = map(new Date().getHours(), 0, 23, 1, 12)

    box.rotation.x += tick
    box.rotation.y += tick
    box.rotation.z += tick
    box.scale.x = s
    box.scale.y = m
    box.scale.z = h
}


function animate() {
    requestAnimationFrame(animate)
    update()
    renderer.render(scene, camera)
}


init()
setup()
animate()
