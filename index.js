import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"


// Data
const monitorWidth = 0.52
const monitorHeight = 0.294
const monitorDepth = 0.4

// Web
const socket = new WebSocket("ws://127.0.0.1:8765")

// Scene + light
const scene = new THREE.Scene()

const ambiLight = new THREE.AmbientLight('white', 0.1)
scene.add(ambiLight)

const dirLight = new THREE.DirectionalLight('white', 3)
dirLight.position.set(1, 1.5, 1)
scene.add(dirLight)

// Camera
const camera = new THREE.PerspectiveCamera()

// Parser + camera set
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data)
    
        const halfW = monitorWidth / 2
        const halfH = monitorHeight / 2

    camera.position.set(
        -data.x + 0,
        -data.y + halfH,
        data.z + 0
    )
  
    const left   = (-halfW + data.x) / data.z
    const right  = ( halfW + data.x) / data.z
    const bottom = (-halfH - (data.y-halfH)) / -data.z
    const top    = ( halfH - (data.y-halfH)) / -data.z

    const near = 0.01
    const far = 10

    camera.projectionMatrix.makePerspective(
        left * near, right * near,
        bottom * near, top * near,
        near, far
    )
})

// Render
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Textures
const texture = new THREE.TextureLoader().load('img/tex.jpg')
const textureMaterial = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide })


// Loaded models
const loader = new GLTFLoader()
loader.load(
    'models/bmw_m2_cs/scene.gltf',
    (gltf) => {
        const model = gltf.scene
        model.scale.set(0.07, 0.07, 0.07)
        model.position.set(-0.15, -0.147, -0.14)
        model.rotation.set(0, 0.4, 0)
        scene.add(model)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100))
    },
    (error) => {
        console.error('Error' + error)
    }
)
loader.load(
    'models/stylized_chest/scene.gltf',
    (gltf) => {
        const model = gltf.scene
        model.scale.set(0.04, 0.04, 0.04)
        model.position.set(0.15, -0.13, -0.14)
        model.rotation.set(0, 4, 0)
        scene.add(model)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100))
    },
    (error) => {
        console.error('Error' + error)
    }
)


// Base models
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 0.1),
    textureMaterial
)
cube.position.set(0, 0.05-0.147, -0.25)
scene.add(cube)


// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(monitorWidth, monitorDepth),
    textureMaterial
)
floor.rotation.x = -Math.PI / 2
floor.position.set(0, -0.147, -monitorDepth / 2)
scene.add(floor)

// Back wall
const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(monitorWidth, monitorHeight),
    textureMaterial
)
backWall.position.set(0, monitorHeight/2-0.147, -monitorDepth)
scene.add(backWall)


function animate(){
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}

animate()
