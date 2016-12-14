'use strict'
const WIDTH = window.innerWIDTH,
      HEIGHT = window.innerHEIGHT,
      RED = new THREE.Color('rgb(255, 137, 95)'),
      GREEN = new THREE.Color('rgb(176, 255, 121)'),
      BLUE = new THREE.Color('rgb(56, 76, 204)'),
      GREY = new THREE.Color('rgb(88,93,110)')

let scene,
    camera,
    renderer,
    data

function init() {
    scene = new THREE.Scene()
    renderer = new THREE.WebGLRenderer({'antialias': true})
    camera = new THREE.PerspectiveCamera(
        50,  // F.O.V
        WIDTH / HEIGHT,  // Aspect
        0.1,  // Near clip
        10000  // Far clip
    )
    camera.position.z = 5
    renderer.setSize(WIDTH, HEIGHT)
    renderer.setClearColor(new THREE.Color(GREY), 1.0)
    document.body.appendChild(renderer.domElement)
}


function setup() {
    let geometries = [],
        materials = [],
        lines = []

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


    for (let record in data) {
        if (!data.hasOwnProperty(record)) {continue}
            // console.log(record)
            let foo = data[record],
                verts = foo['verts'],
                geometries.push(new THREE.Geometry())
            // console.log(foo)
            // console.log(verts)
            for (let vert of verts) {
                geometries.vertices.push(new THREE.Vector3().fromArray(vert))
            }
            materials = new THREE.LineBasicMaterial({'color': foo['color']})
            lines.push(new THREE.LineSegments(geometries, materials))
    }

    for (let line of lines) {
            // console.log(line)
            scene.add(line)
    }
}


function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}


init()
// setup()
animate()
