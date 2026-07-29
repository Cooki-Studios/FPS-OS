import {
  WebGLRenderer,
  SRGBColorSpace,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  Timer,
} from "three";
import { updatePhysics } from "./physics";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

const timer = new Timer();

export function initRenderer(scene: Scene, camera: PerspectiveCamera) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  renderer.domElement.oncontextmenu = (e) => {
    e.preventDefault();
  };

  document.body.appendChild(renderer.domElement);

  window.onresize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };

  const controls = new PointerLockControls(camera, document.body);
  document.body.onclick = () => controls.lock();

  controls.addEventListener("lock", function () {
    document.dispatchEvent(new CustomEvent("lock"));
  });
  controls.addEventListener("unlock", function () {
    document.dispatchEvent(new CustomEvent("unlock"));
  });

  function animate(time: number) {
    timer.update(time);
    const delta = timer.getDelta();

    updatePhysics(delta);

    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);
}
