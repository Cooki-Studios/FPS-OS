import { Scene, AmbientLight, DirectionalLight, CameraHelper } from "three";

export function initLighting(scene: Scene, debug = false) {
  const light = new AmbientLight(0xffffff, 3.0); // global light
  scene.add(light);

  const directionalLight = new DirectionalLight(0xffffff, 1.0); // shading light
  scene.add(directionalLight);
  directionalLight.castShadow = true;
  directionalLight.position.set(10, 20, 10);

  const shadowCam = directionalLight.shadow.camera;
  shadowCam.left = -20;
  shadowCam.right = 20;
  shadowCam.top = 20;
  shadowCam.bottom = -20;
  shadowCam.near = 0.5;
  shadowCam.far = 50;
  shadowCam.updateProjectionMatrix();

  if (debug) scene.add(new CameraHelper(directionalLight.shadow.camera));

  directionalLight.shadow.intensity = 0.55;
  directionalLight.shadow.bias = 0.01;
  directionalLight.shadow.mapSize.width = 4096;
  directionalLight.shadow.mapSize.height = 4096;
}
