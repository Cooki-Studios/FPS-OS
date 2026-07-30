import * as THREE from "three";
import { updatePhysics } from "./physics";

let renderer: THREE.WebGLRenderer;
export const timer = new THREE.Timer();
export let enabled = false;

export function enableRenderer() {
  enabled = true;
}

export function initRenderer(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
): HTMLCanvasElement {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const canvas = renderer.domElement;

  canvas.oncontextmenu = (e) => {
    e.preventDefault();
  };

  document.body.appendChild(canvas);

  window.onresize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };

  function animate(time: number) {
    if (!enabled) return;

    timer.update(time);
    const delta = timer.getDelta();

    updatePhysics(delta);

    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);

  return canvas;
}

export function compileRenderer(scene: THREE.Scene, camera: THREE.Camera) {
  renderer.compile(scene, camera);
}
