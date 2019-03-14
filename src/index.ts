import {
  Engine,
  Scene,
  HemisphericLight,
  Vector3,
  ArcRotateCamera,
  MeshBuilder,
  Axis,
  TransformNode
} from "babylonjs";

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("3d-view") as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = createScene(engine);

  const sphere = MeshBuilder.CreateIcoSphere("sphere", { radius: 1 }, scene);
  sphere.position = new Vector3(0, 5, 0);
  const height = 5;

  engine.runRenderLoop(() => scene.render());
});

function createScene(engine: Engine): Scene {
  const scene = new Scene(engine);
  const camera = new ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 2,
    2,
    new Vector3(0, 5, 15),
    scene
  );
  const sun = new HemisphericLight("sun", new Vector3(1, 1, 0), scene);
  createStage(scene);

  return scene;
}

function createStage(scene: Scene) {
  const stage = new TransformNode("stage");

  const ground = MeshBuilder.CreateGround(
    "ground",
    { width: 10, height: 10 },
    scene
  );
  ground.parent = stage;

  const beam = MeshBuilder.CreateCylinder(
    "beam",
    { height: 10, diameter: 0.2 },
    scene
  );
  beam.setEnabled(false);

  beam.createInstance("back right pillar").position = new Vector3(-5, 5, -5);
  beam.createInstance("back left pillar").position = new Vector3(5, 5, -5);
  beam.createInstance("front right pillar").position = new Vector3(-5, 5, 5);
  beam.createInstance("front left pillar").position = new Vector3(5, 5, 5);

  const front = beam.createInstance("front beam");
  front.rotate(Axis.Z, Math.PI / 2);
  front.position = new Vector3(0, 10, 5);

  const back = beam.createInstance("back beam");
  back.rotate(Axis.Z, Math.PI / 2);
  back.position = new Vector3(0, 10, -5);

  const right = beam.createInstance("left beam");
  right.rotate(Axis.X, Math.PI / 2);
  right.position = new Vector3(-5, 10, 0);

  const left = beam.createInstance("left beam");
  left.rotate(Axis.X, Math.PI / 2);
  left.position = new Vector3(5, 10, 0);
}
