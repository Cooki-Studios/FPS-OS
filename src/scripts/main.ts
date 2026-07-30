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
camera.position.set(0, 2.8, 4);

const manager = new THREE.LoadingManager();
manager.onLoad = () => {
  compileRenderer(scene, camera);
  enableRenderer();

  room.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.name.startsWith("D_")) {
        addPhysicsToObject(child, true, true, scene);
      } else addPhysicsToObject(child, false, true, scene);
    }
  });

  console.log("Loading complete!");
};

initLighting(scene);
const canvas = initRenderer(scene, camera);
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

room.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    child.receiveShadow = true;
    child.castShadow = false;

    if (child.name == "D_Cube_001" && child.parent) {
      child.parent.rotation.x = Math.random() * Math.PI * 2;
      child.parent.rotation.y = Math.random() * Math.PI * 2;
      child.parent.rotation.z = Math.random() * Math.PI * 2;
    }

    if (child.name.startsWith("D_")) {
      child.castShadow = true;
    } else {
      hdrLoader
        .loadAsync(`/fps-os/textures/${child.name}_Baked.hdr`)
        .then((tex) => {
          child.geometry.setAttribute("uv2", child.geometry.attributes.uv);
          child.material.lightMap = tex;
          child.material.lightMapIntensity = 2.5;

          child.material.needsUpdate = true;
        });
    }
  }
});
scene.add(room);
