import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "dat.gui";
import { DIRECTIONAL_LIGHT_INTENSITY, LIGHT_COLOR } from './Components/Constants';
import { Truck } from './Components/Truck';
import { Plane } from './Components/Plane';
import { CenterPin } from './Components/CenterPin';

const stats = new Stats()

const scene = new THREE.Scene()

const gui = new GUI()

// DirectionalLight
const data = {
    color: DIRECTIONAL_LIGHT_INTENSITY,
    lightColor: LIGHT_COLOR,
    shadowMapSizeWidth: 512,
    shadowMapSizeHeight: 512,
}

const directionalLight = new THREE.DirectionalLight(data.lightColor, Math.PI)
directionalLight.position.set(100, 300, 100)
directionalLight.rotateY(Math.PI / 18);
directionalLight.castShadow = true
directionalLight.shadow.camera = new THREE.OrthographicCamera(200, -200, -200, 200, 0, 10);
directionalLight.shadow.mapSize.width = data.shadowMapSizeWidth
directionalLight.shadow.mapSize.height = data.shadowMapSizeHeight
scene.add(directionalLight)

const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
directionalLightHelper.visible = false
scene.add(directionalLightHelper)

const directionalLightFolder = gui.addFolder('DirectionalLight')
directionalLightFolder.add(directionalLight, 'visible')
directionalLightFolder.addColor(data, 'lightColor').onChange(() => {
    directionalLight.color.set(data.lightColor)
})
directionalLightFolder.add(directionalLight, 'intensity', 0, Math.PI * 10)
directionalLightFolder.add(directionalLight.position, 'x', -5, 1000, 0.001).onChange(() => {
    directionalLightHelper.update()
})
directionalLightFolder.add(directionalLight.position, 'y', -5, 1000, 0.001).onChange(() => {
    directionalLightHelper.update()
})
directionalLightFolder.add(directionalLight.position, 'z', -5, 1000, 0.001).onChange(() => {
    directionalLightHelper.update()
})
directionalLightFolder.add(directionalLightHelper, 'visible').name('Helper Visible')
directionalLightFolder.add(directionalLight.shadow.camera, 'near', 0, 100).onChange(() => {
    directionalLight.shadow.camera.updateProjectionMatrix()
    directionalLightHelper.update()
})
directionalLightFolder.add(directionalLight.shadow.camera, 'far', 0.1, 1000).onChange(() => {
    directionalLight.shadow.camera.updateProjectionMatrix()
    directionalLightHelper.update()
})
directionalLightFolder.add(data, 'shadowMapSizeWidth', [256, 512, 1024, 2048, 4096]).onChange(() => updateDirectionalLightShadowMapSize())
directionalLightFolder.add(data, 'shadowMapSizeHeight', [256, 512, 1024, 2048, 4096]).onChange(() => updateDirectionalLightShadowMapSize())
directionalLightFolder.add(directionalLight.shadow, 'radius', 1, 10, 1).name('radius (PCF | VSM)') // PCFShadowMap or VSMShadowMap
directionalLightFolder.add(directionalLight.shadow, 'blurSamples', 1, 20, 1).name('blurSamples (VSM)') // VSMShadowMap only
directionalLightFolder.open()

function updateDirectionalLightShadowMapSize() {
    directionalLight.shadow.mapSize.width = data.shadowMapSizeWidth
    directionalLight.shadow.mapSize.height = data.shadowMapSizeHeight
    directionalLight.shadow.map = null
}
// #endregion
scene.add(directionalLight);

// Main camera for capturing scene
const camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(0, 200, 500);

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;

document.body.appendChild(renderer.domElement)
document.body.appendChild(stats.dom);

new OrbitControls(camera, renderer.domElement);

const plane = Plane();
plane.rotation.x = -Math.PI / 2;
plane.position.y = -10;
scene.add(plane);

const truck = new Truck();
const truckMesh = truck.getTruckMesh();
truckMesh.position.setY(plane.position.y + 18);
scene.add(truckMesh)

const pivotPos = new THREE.Vector3(0, truckMesh?.position.y, 0);

// Truck HeadLight helper region
const leftSpotLightHelper = new THREE.SpotLightHelper(truckMesh.getObjectByName("leftHeadLight") as THREE.SpotLight);
leftSpotLightHelper.visible = true
scene.add(leftSpotLightHelper)

const rightSpotLightHelper = new THREE.SpotLightHelper(truckMesh.getObjectByName("rightHeadLight") as THREE.SpotLight);
rightSpotLightHelper.visible = true
scene.add(rightSpotLightHelper)

// RayCaster 
const rayCaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const centerPin = new CenterPin(50).getPinMesh();
scene.add(centerPin);

renderer.domElement.addEventListener('mousemove', (ev) => {
    mouse.set((ev.clientX / renderer.domElement.clientWidth) * 2 - 1, -(ev.clientY / renderer.domElement.clientHeight) * 2 + 1);
    rayCaster.setFromCamera(mouse, camera);

    const intersects = rayCaster.intersectObjects([plane], false);

    if (intersects.length) {
        centerPin.position.set(intersects[0].point.x, centerPin.position.y, intersects[0].point.z);
        pivotPos.set(intersects[0].point.x, truckMesh.position.y, intersects[0].point.z);
    }
});

renderer.domElement.addEventListener('dblclick', (ev) => {
    mouse.set((ev.clientX / renderer.domElement.clientWidth) * 2 - 1, -(ev.clientY / renderer.domElement.clientHeight) * 2 + 1);
    rayCaster.setFromCamera(mouse, camera);

    const intersects = rayCaster.intersectObjects([truck.getTruckMesh()], false);

    if (intersects.length) {
        truck.setMoveAble(!truck.isMoveAble());
    }
});

const cameraFolder = gui.addFolder("Camera")
cameraFolder.add(camera.position, "z", 0, 500)
cameraFolder.add(camera.position, "y", 0, 500)
cameraFolder.add(camera.position, "x", 0, 500)
cameraFolder.open()

const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

// Execute on every animation
const animate = () => {
    requestAnimationFrame(animate);

    leftSpotLightHelper.update();
    rightSpotLightHelper.update();
    stats.update();
    truck.lookAt(pivotPos);
    render();
}

// Renders scene using camera
const render = () => {
    renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize, false);

animate();

