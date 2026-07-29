import { Mesh, MeshPhysicalMaterial, PerspectiveCamera, Scene } from "three";
import { USDLoader } from "three/examples/jsm/loaders/USDLoader.js";
import { initLighting } from "./lighting";
import { initRenderer } from "./renderer";
import { addPhysicsToObject, initPhysics, togglePhysicsDebug } from "./physics";
import { initInput, onActionPressed } from "./input";

const scene = new Scene();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.rotation.order = "YXZ";
camera.position.set(0, 2.8, 0);

initLighting(scene);
initRenderer(scene, camera);
initPhysics(scene);
initInput();

onActionPressed("debug", () => {
  togglePhysicsDebug();
});

const loader = new USDLoader();
const room = await loader.loadAsync("room.usdc");

room.traverse((child) => {
  if (child instanceof Mesh) {
    child.receiveShadow = true;
    child.castShadow = true;

    if (child.material && child.material.type === "MeshBasicMaterial") {
      child.material = new MeshPhysicalMaterial({
        color: child.material.color,
        map: child.material.map,
      });
    }

    if (child.name.startsWith("D_")) {
      addPhysicsToObject(child, true, true, scene);
    } else addPhysicsToObject(child, false, true, scene);
  }
});
scene.add(room);
