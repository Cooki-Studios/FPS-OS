import * as THREE from "three";
import { USDLoader } from "three/examples/jsm/loaders/USDLoader.js";
import { initLighting } from "./lighting";
import { compileRenderer, enableRenderer, initRenderer } from "./renderer";
import { addPhysicsToObject, initPhysics, togglePhysicsDebug } from "./physics";
import { disableInput, enableInput, initInput, onActionPressed } from "./input";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.rotation.order = "YXZ";

const player = new THREE.Group();

const playerGeo = new THREE.CapsuleGeometry(1, 2);
const playerMat = new THREE.MeshPhysicalMaterial({
  colorWrite: false,
});
const playerMesh = new THREE.Mesh(playerGeo, playerMat);
playerMesh.castShadow = true;

scene.add(player);
player.position.set(0, 2, 0);
player.add(playerMesh);
player.add(camera);
camera.position.set(0, 1.8, 0);

const manager = new THREE.LoadingManager();
manager.onLoad = () => {
  for (const mesh of meshes) {
    if (mesh.name.startsWith("D_")) {
      addPhysicsToObject(mesh, true, true, false, scene);
    } else addPhysicsToObject(mesh, false, true, false, scene);
  }

  addPhysicsToObject(playerMesh, true, false, true, scene);

  compileRenderer(scene, camera);
  enableRenderer(scene, camera);

  console.log("Loading complete!");
};

initLighting(scene);
const canvas = initRenderer(camera);
initPhysics(scene);
initInput();

const controls = new PointerLockControls(camera, canvas);
canvas.onclick = () => controls.lock();

controls.addEventListener("lock", function () {
  enableInput();
});
controls.addEventListener("unlock", function () {
  disableInput();
});

onActionPressed("debug", () => {
  togglePhysicsDebug();
});

const loader = new USDLoader(manager);
const room = await loader.loadAsync("room.usdc");
const hdrLoader = new HDRLoader(manager);

const meshes: THREE.Mesh[] = [];
room.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    meshes.push(child);
  }
});

for (const mesh of meshes) {
  if (!mesh.parent) continue;

  if (mesh.name === "D_Cube_001") {
    mesh.parent.rotation.x = Math.random() * Math.PI * 2;
    mesh.parent.rotation.y = Math.random() * Math.PI * 2;
    mesh.parent.rotation.z = Math.random() * Math.PI * 2;
  }

  scene.attach(mesh.parent);

  mesh.receiveShadow = true;

  if (mesh.name.startsWith("D_")) {
    mesh.castShadow = true;
  } else {
    hdrLoader
      .loadAsync(`/fps-os/textures/${mesh.name}_Baked.hdr`)
      .then((tex) => {
        const mat = Array.isArray(mesh.material)
          ? (mesh.material[0] as THREE.MeshPhysicalMaterial)
          : (mesh.material as THREE.MeshPhysicalMaterial);

        if (mat && "aoMap" in mat) {
          mat.aoMap = tex;
          mat.needsUpdate = true;
        }

        mat.needsUpdate = true;
      });
  }
}
