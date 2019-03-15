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

type TreeGenerator = (origin: Vector3, tip: Vector3) => Iterable<Vector3[]>;

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("3d-view") as HTMLCanvasElement;

  const engine = new Engine(canvas, true);
  const scene = createScene(engine);
  const stage = createStage({ width: 10, depth: 10, height: 10 }, scene);

  const camera = new ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 2,
    2,
    new Vector3(0, 5, 0),
    scene,
  );
  camera.useAutoRotationBehavior = true;
  camera.position = new Vector3(0, 5, -14);
  camera.attachControl(canvas, true);

  /*
  const sphere = MeshBuilder.CreateIcoSphere("sphere", { radius: 1 }, scene);
  sphere.position = new Vector3(0, 5, 0);
  */

  const offsets = spokes(3, Math.PI * 0.2, 1);
  const subOffsets = leftRight(0.5, 0.5, -0.5);

  generateTreeMesh(
    tree(
      branch(
        offsets.next().value,
        tree(
          branch(subOffsets.next().value, tree()),
          branch(subOffsets.next().value, tree()),
        ),
      ),
      branch(offsets.next().value, tree()),
      branch(offsets.next().value, tree()),
    )(new Vector3(0, 0, 0), new Vector3(0, 5, 0)),
    scene,
  );

  engine.runRenderLoop(() => scene.render());
});

function* spokes(n: number, phi: number, y: number = 0) {
  const increment = (2 * Math.PI) / n;
  let angle = phi;
  while (true) {
    yield new Vector3(Math.sin(angle), y, Math.cos(angle));
    angle += increment;
    if (angle > 2 * Math.PI) {
      angle -= 2 * Math.PI;
    }
  }
}

function* leftRight(x: number, y: number, z: number) {
  while (true) {
    yield new Vector3(x, y, z);
    yield new Vector3(-x, y, -z);
  }
}

function tree(...branches: TreeGenerator[]): TreeGenerator {
  return function*(origin, tip) {
    yield [origin, origin.add(tip)];
    for (const [index, branch] of branches.entries()) {
      yield* branch(
        origin.add(tip.scale((index + 1) / (branches.length + 1))),
        tip.scale(0.5),
      );
    }
  };
}

function branch(offset: Vector3, tree: TreeGenerator): TreeGenerator {
  return function*(origin, tip) {
    const _offset = origin.add(offset);
    yield [origin, _offset];
    yield* tree(_offset, tip);
  };
}

function generateTreeMesh(tree: Iterable<Vector3[]>, scene: Scene) {
  const lines = Array.from(tree);
  const treeMesh = MeshBuilder.CreateLineSystem("tree", { lines }, scene);
  treeMesh.color = new Color3(0.1, 0.7, 0.1);
  return treeMesh;
}

function createScene(engine: Engine): Scene {
  const scene = new Scene(engine);
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
