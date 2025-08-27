import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

// ---------------- DATA ----------------
const monitorWidth = 0.52
const monitorHeight = 0.294
const monitorDepth = 0.4
const halfW = monitorWidth / 2
const halfH = monitorHeight / 2
const eyeStep = 0.06

// ---------------- SOCKET ----------------
const socket = new WebSocket("ws://127.0.0.1:8765")

// ---------------- SCENE & LIGHT ----------------
const scene = new THREE.Scene()

const ambiLight = new THREE.AmbientLight('white', 0.1)
scene.add(ambiLight)

const dirLight = new THREE.DirectionalLight('white', 3)
dirLight.position.set(1, 1.5, 1)
scene.add(dirLight)

// ---------------- CAMERA ----------------
const camera = new THREE.PerspectiveCamera()

// ---------------- RENDERER ----------------
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// ---------------- TEXTURE ----------------
const texture = new THREE.TextureLoader().load('img/tex.jpg')
const textureMaterial = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide })

// ---------------- MODELS ----------------
const loader = new GLTFLoader()
loader.load('models/bmw_m2_cs/scene.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(0.08, 0.08, 0.08)
    model.position.set(-0.1, -halfH + halfH, -0.04)
    model.rotation.set(0, 0.1, -0.4)
    //scene.add(model)
})
loader.load('models/stylized_chest/scene.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(0.04, 0.04, 0.04)
    model.position.set(0.15, -halfH + 0.117, -0.04)
    model.rotation.set(0, 4, 0)
    scene.add(model)
})

// ---------------- BASE OBJECTS ----------------
const cube = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), textureMaterial)
cube.position.set(0, -halfH+0.05, -0.2)
scene.add(cube)

const floor = new THREE.Mesh(new THREE.PlaneGeometry(monitorWidth, monitorDepth), textureMaterial)
floor.rotation.x = -Math.PI / 2
floor.position.set(0, -halfH, -monitorDepth / 2)
scene.add(floor)

const backWall = new THREE.Mesh(new THREE.PlaneGeometry(monitorWidth, monitorHeight), textureMaterial)
backWall.position.set(0, monitorHeight / 2 - halfH, -monitorDepth)
scene.add(backWall)

// ---------------- DEBUG OBJECTS ----------------


// ---------------- SOCKET DATA ----------------
let latestData = { x: 0, y: 0, z: 1 }
socket.addEventListener('message', (event) => {
    latestData = JSON.parse(event.data)

    camera.position.set(-latestData.x, -latestData.y + halfH, latestData.z)

    const left = (-halfW + latestData.x) / latestData.z
    const right = (halfW + latestData.x) / latestData.z
    const bottom = (-halfH - (latestData.y - halfH)) / -latestData.z
    const top = (halfH - (latestData.y - halfH)) / -latestData.z
    const near = 0.01
    const far = 10

    camera.projectionMatrix.makePerspective(
        left * near, right * near,
        bottom * near, top * near,
        near, far
    )
})

// ---------------- MODES ----------------
let mode = 1 // "normal" | "anaglyph"

// ---------------- CUSTOM ANAGLYPH ----------------
function makeFrustumShifted(baseMatrix, eyeOffset, near, focus = 1.0) {


    const leftBound = (-halfW + latestData.x) / latestData.z
    const rightBound = (halfW + latestData.x) / latestData.z
    const bottomBound = (-halfH - (latestData.y - halfH)) / -latestData.z
    const topBound = (halfH - (latestData.y - halfH)) / -latestData.z
    const far = 10

    const shift = eyeOffset * near / focus

    const matrix = new THREE.Matrix4()
    matrix.makePerspective(
        (leftBound * near) + shift,
        (rightBound * near) + shift,
        bottomBound * near,
        topBound * near,
        near,
        far
    )

    return matrix
}

function renderAnaglyph() {
    const gl = renderer.getContext()
    renderer.clear()

    const originalPosition = camera.position.clone()
    const near = 0.01
    const focusObjectZ = 0.2
    const focus = (-camera.position.z - focusObjectZ)

    // lefe eye (red)
    camera.position.x = originalPosition.x - eyeStep / 2
    camera.projectionMatrix = makeFrustumShifted(camera.projectionMatrix, -eyeStep / 2, near, focus)
    gl.colorMask(true, false, false, true)
    renderer.render(scene, camera)

    // Right eye (blue)
    camera.position.x = originalPosition.x + eyeStep
    camera.projectionMatrix = makeFrustumShifted(camera.projectionMatrix, +eyeStep, near, focus)
    gl.colorMask(false, true, true, true)
    renderer.render(scene, camera)

    // Restore
    camera.position.copy(originalPosition)
    gl.colorMask(true, true, true, true)
}

// ---------------- ANIMATE ----------------
function animate() {
    requestAnimationFrame(animate)

    if (!mode) {
        renderer.render(scene, camera)
    } else {
        renderAnaglyph()
    }
}

animate()
