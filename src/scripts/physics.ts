import initJolt from "jolt-physics/wasm-compat";
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  Scene,
} from "three";

let Jolt: typeof initJolt;
let joltInterface: initJolt.JoltInterface;
const dynamicObjects: Mesh[] = [];
const LAYER_STATIC = 0;
const LAYER_DYNAMIC = 1;
const NUM_OBJECT_LAYERS = 2;
const debugGroup = new Group();
debugGroup.visible = false;

export async function initPhysics(scene: Scene) {
  Jolt = await initJolt();

  const settings = new Jolt.JoltSettings();
  settings.mMaxWorkerThreads = 3;

  setupCollisionFiltering(settings);

  joltInterface = new Jolt.JoltInterface(settings);
  Jolt.destroy(settings);

  debugGroup.rotateX(-Math.PI / 2);
  scene.add(debugGroup);

  joltInterface.GetPhysicsSystem().SetGravity(new Jolt.Vec3(0, 0, -9.81));
}

export async function addPhysicsToObject(
  obj: Mesh,
  dynamic: boolean = false,
  showDebug = false,
  scene?: Scene,
) {
  if (!obj.parent) return;

  const bodyInterface = joltInterface.GetPhysicsSystem().GetBodyInterface();
  let shape: initJolt.Shape;

  switch (obj.name.replace("D_", "").split("_")[0]) {
    default: {
      obj.updateMatrixWorld(true);

      const posAttr = obj.geometry.attributes.position;
      const vertices = new Jolt.ArrayVec3();

      for (let i = 0; i < posAttr.count; i++) {
        vertices.push_back(
          new Jolt.Vec3(
            posAttr.getX(i) * obj.scale.x,
            posAttr.getY(i) * obj.scale.y,
            posAttr.getZ(i) * obj.scale.z,
          ),
        );
      }

      const shapeSettings = new Jolt.ConvexHullShapeSettings();
      shapeSettings.set_mPoints(vertices);

      const shapeResult = shapeSettings.Create();
      shape = shapeResult.Get();

      Jolt.destroy(vertices);
      Jolt.destroy(shapeSettings);

      break;
    }
  }

  const pos = new Jolt.RVec3(
    obj.parent.position.x,
    obj.parent.position.y,
    obj.parent.position.z,
  );
  const rot = new Jolt.Quat(
    obj.parent.quaternion.x,
    obj.parent.quaternion.y,
    obj.parent.quaternion.z,
    obj.parent.quaternion.w,
  );

  const creationSettings = new Jolt.BodyCreationSettings(
    shape,
    pos,
    rot,
    dynamic ? Jolt.EMotionType_Dynamic : Jolt.EMotionType_Static,
    dynamic ? LAYER_DYNAMIC : LAYER_STATIC,
  );

  const body = bodyInterface.CreateBody(creationSettings);
  bodyInterface.AddBody(body.GetID(), Jolt.EActivation_Activate);

  Jolt.destroy(creationSettings);

  obj.userData.body = body;
  dynamicObjects.push(obj);

  if (showDebug && scene) {
    const debugMesh = createDebugMesh(shape);
    obj.userData.debugMesh = debugMesh;
    debugGroup.add(debugMesh);
  }
}

export function togglePhysicsDebug() {
  debugGroup.visible = !debugGroup.visible;
}

function createDebugMeshForShape(shape: initJolt.Shape): BufferGeometry {
  const scale = new Jolt.Vec3(1, 1, 1);
  const triContext = new Jolt.ShapeGetTriangles(
    shape,
    Jolt.AABox.prototype.sBiggest(),
    shape.GetCenterOfMass(),
    Jolt.Quat.prototype.sIdentity(),
    scale,
  );
  Jolt.destroy(scale);

  const vertices = new Float32Array(
    Jolt.HEAPF32.buffer,
    triContext.GetVerticesData(),
    triContext.GetVerticesSize() / Float32Array.BYTES_PER_ELEMENT,
  ).slice();

  Jolt.destroy(triContext);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createDebugMesh(shape: initJolt.Shape): Mesh {
  const geometry = createDebugMeshForShape(shape);
  const material = new MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
  });
  const mesh = new Mesh(geometry, material);
  return mesh;
}

export function updatePhysics(delta: number) {
  if (!joltInterface) return;

  const bodyInterface = joltInterface.GetPhysicsSystem().GetBodyInterface();

  for (const obj of dynamicObjects) {
    if (!obj.parent) return;

    const body = obj.userData.body;

    const pos = bodyInterface.GetPosition(body.GetID());
    const rot = bodyInterface.GetRotation(body.GetID());

    obj.parent.position.set(pos.GetX(), pos.GetY(), pos.GetZ());
    obj.parent.quaternion.set(rot.GetX(), rot.GetY(), rot.GetZ(), rot.GetW());

    if (obj.userData.debugMesh) {
      obj.userData.debugMesh.position.set(pos.GetX(), pos.GetY(), pos.GetZ());
      obj.userData.debugMesh.quaternion.set(
        rot.GetX(),
        rot.GetY(),
        rot.GetZ(),
        rot.GetW(),
      );
    }
  }

  var numSteps = delta > 1.0 / 55.0 ? 2 : 1;
  joltInterface.Step(delta, numSteps);
}

function setupCollisionFiltering(settings: initJolt.JoltSettings) {
  let objectFilter = new Jolt.ObjectLayerPairFilterTable(NUM_OBJECT_LAYERS);
  objectFilter.EnableCollision(LAYER_STATIC, LAYER_DYNAMIC);
  objectFilter.EnableCollision(LAYER_DYNAMIC, LAYER_DYNAMIC);

  const BP_LAYER_STATIC = new Jolt.BroadPhaseLayer(0);
  const BP_LAYER_DYNAMIC = new Jolt.BroadPhaseLayer(1);
  const NUM_BROAD_PHASE_LAYERS = 2;
  let bpInterface = new Jolt.BroadPhaseLayerInterfaceTable(
    NUM_OBJECT_LAYERS,
    NUM_BROAD_PHASE_LAYERS,
  );
  bpInterface.MapObjectToBroadPhaseLayer(LAYER_STATIC, BP_LAYER_STATIC);
  bpInterface.MapObjectToBroadPhaseLayer(LAYER_DYNAMIC, BP_LAYER_DYNAMIC);

  settings.mObjectLayerPairFilter = objectFilter;
  settings.mBroadPhaseLayerInterface = bpInterface;
  settings.mObjectVsBroadPhaseLayerFilter =
    new Jolt.ObjectVsBroadPhaseLayerFilterTable(
      settings.mBroadPhaseLayerInterface,
      NUM_BROAD_PHASE_LAYERS,
      settings.mObjectLayerPairFilter,
      NUM_OBJECT_LAYERS,
    );
}
