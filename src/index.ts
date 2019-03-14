import {
  Engine,
  Scene,
  HemisphericLight,
  Vector3,
  ArcRotateCamera,
  MeshBuilder,
  Axis,
  TransformNode,
  Color3,
} from "babylonjs";

interface Tree {
  height: number;
  branches?: Branch[];
}

interface Branch {
  // at which height the branch occurs
  height: number;
  offset: [number, number, number];
  tree: Tree;
}

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("3d-view") as HTMLCanvasElement;

  const engine = new Engine(canvas, true);
  const scene = createScene(engine);
  const stage = createStage({ width: 10, depth: 10, height: 10 }, scene);

  /*
  const sphere = MeshBuilder.CreateIcoSphere("sphere", { radius: 1 }, scene);
  sphere.position = new Vector3(0, 5, 0);
  */

  const tree: Tree = {
    height: 5,
    branches: [
      { height: 2.5, offset: [1, 1, 1], tree: { height: 2 } },
      { height: 4, offset: [-1, 1, 0], tree: { height: 1 } },
    ],
  };

  generateTreeMesh(tree, scene);

  engine.runRenderLoop(() => scene.render());
});

function* generateTreeLines(origin: Vector3, tree: Tree): Iterable<Vector3[]> {
  yield [origin, origin.add(new Vector3(0, tree.height, 0))];
  if (tree.branches) {
    for (const branch of tree.branches) {
      const branchOrigin = origin.add(new Vector3(0, branch.height, 0));
      const offset = branchOrigin.add(Vector3.FromArray(branch.offset));
      yield [branchOrigin, offset];
      yield* generateTreeLines(offset, branch.tree);
    }
  }
}

function generateTreeMesh(tree: Tree, scene: Scene) {
  const lines = Array.from(generateTreeLines(new Vector3(0, 0, 0), tree));

  const treeMesh = MeshBuilder.CreateLineSystem("tree", { lines }, scene);
  treeMesh.color = new Color3(0.1, 0.7, 0.1);
  return treeMesh;
}

function createScene(engine: Engine): Scene {
  const scene = new Scene(engine);
  const camera = new ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 2,
    2,
    new Vector3(0, 5, 15),
    scene,
  );
  const sun = new HemisphericLight("sun", new Vector3(1, 1, 0), scene);

  return scene;
}

interface StageParameters {
  width: number;
  depth: number;
  height: number;
}

function createStage(parameters: StageParameters, scene: Scene) {
  const { width, depth, height } = parameters;
  const stage = new TransformNode("stage");
  const right = -0.5 * width;
  const left = 0.5 * width;
  const bottom = 0;
  const top = height;
  const front = 0.5 * depth;
  const back = -0.5 * depth;

  const ground = MeshBuilder.CreateGround(
    "ground",
    { width, height: depth },
    scene,
  );
  ground.parent = stage;

  const beam = MeshBuilder.CreateCylinder(
    "beam",
    { height, diameter: 0.2 },
    scene,
  );
  beam.setEnabled(false);

  const backRight = beam.createInstance("back right pillar");
  backRight.position = new Vector3(right, 5, back);
  backRight.parent = stage;

  const backLeft = beam.createInstance("back left pillar");
  backLeft.position = new Vector3(left, 5, back);
  backLeft.parent = stage;

  const frontRight = beam.createInstance("front right pillar");
  frontRight.position = new Vector3(right, 5, front);
  frontRight.parent = stage;

  const frontLeft = beam.createInstance("front left pillar");
  frontLeft.position = new Vector3(left, 5, front);
  frontLeft.parent = stage;

  const frontBeam = beam.createInstance("front beam");
  frontBeam.rotate(Axis.Z, Math.PI / 2);
  frontBeam.position = new Vector3(0, top, front);
  frontBeam.parent = stage;

  const backBeam = beam.createInstance("back beam");
  backBeam.rotate(Axis.Z, Math.PI / 2);
  backBeam.position = new Vector3(0, top, back);
  backBeam.parent = stage;

  const rightBeam = beam.createInstance("left beam");
  rightBeam.rotate(Axis.X, Math.PI / 2);
  rightBeam.position = new Vector3(right, top, 0);
  rightBeam.parent = stage;

  const leftBeam = beam.createInstance("left beam");
  leftBeam.rotate(Axis.X, Math.PI / 2);
  leftBeam.position = new Vector3(left, top, 0);
  leftBeam.parent = stage;

  return stage;
}
