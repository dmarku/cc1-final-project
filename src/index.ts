import { Engine, Scene } from "babylonjs";

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("3d-view") as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  engine.runRenderLoop(() => scene.render());
});
