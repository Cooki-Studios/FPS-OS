import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  Timer,
  WebGLRenderer,
} from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

const scene = new Scene();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.rotation.order = "YXZ";

const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.onresize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

const floor_geometry = new BoxGeometry(10, 0.2, 10);
const floor_material = new MeshBasicMaterial({ color: 0xfff000 });
const floor = new Mesh(floor_geometry, floor_material);
scene.add(floor);

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: 0x00ff00 });
const cube = new Mesh(geometry, material);
cube.position.set(0, 1, -2);
scene.add(cube);

const player_geometry = new BoxGeometry(0.5, 2, 0.5);
const player_material = new MeshBasicMaterial({ visible: false });
const player = new Mesh(player_geometry, player_material);
player.position.set(0, 2, 0);
player.attach(camera);
camera.position.set(0, 0.8, 0);
scene.add(player);

const cam_controls = new PointerLockControls(camera, document.body);
document.body.onclick = () => cam_controls.lock();

const timer = new Timer();
function animate(time: number) {
  timer.update(time);
  // const delta = Math.min(timer.getDelta(), 0.1);

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
