import { Scene, AmbientLight, DirectionalLight, CameraHelper } from "three";

export function initLighting(scene: Scene, debug = false) {
  const light = new AmbientLight(0xffffff, 3.0); // global light
  scene.add(light);

  const directionalLight = new DirectionalLight(0xffffff, 3.0); // shading light
  scene.add(directionalLight);
  directionalLight.castShadow = true;
  directionalLight.position.set(10, 20, 10);

  const shadowCam = directionalLight.shadow.camera;
  const shadowRes = 10;
  shadowCam.left = -shadowRes;
  shadowCam.right = shadowRes;
  shadowCam.top = shadowRes;
  shadowCam.bottom = -shadowRes;
  shadowCam.updateProjectionMatrix();

  if (debug) scene.add(new CameraHelper(shadowCam));

  directionalLight.shadow.intensity = 0.55;
  directionalLight.shadow.normalBias = -0.04;
  directionalLight.shadow.radius = 1.5;

  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
}
