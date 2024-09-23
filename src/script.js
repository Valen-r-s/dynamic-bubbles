import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

/**
 * Base
 */
// Debug
const gui = new GUI({
  title: "Play with the Bubbles",
  width: 300,
  closeFolders: true,
});
gui.close();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Axes helper
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load("/textures/matcaps/9.jpg");
matcapTexture.colorSpace = THREE.SRGBColorSpace;

//Array to hold the bubbles
let bubbles = [];

/**
 * Fonts
 */
const loader = new FontLoader();

loader.load(
  // resource URL
  "fonts/helvetiker_regular.typeface.json",

  // onLoad callback
  (font) => {
    //Text material
    const material = new THREE.MeshMatcapMaterial({
      matcap: matcapTexture,
    });

    //Sphere material
    const sphereMaterial = new THREE.MeshPhysicalMaterial();
    sphereMaterial.metalness = 0;
    sphereMaterial.roughness = 0;
    //Iridescence
    sphereMaterial.iridescence = 1;
    sphereMaterial.iridescenceIOR = 1;
    sphereMaterial.iridescenceThicknessRange = [100, 800];
    //transmission
    sphereMaterial.transmission = 1;
    sphereMaterial.ior = 1.5;
    sphereMaterial.thickness = 0.5;

    //Folders
    const materialPropertiesFolder = gui.addFolder("Material Properties");
    const iridescenceFolder = gui.addFolder("Iridescence");
    const transmissionFolder = gui.addFolder("Transmission");

    materialPropertiesFolder.close();
    iridescenceFolder.close();
    transmissionFolder.close();

    //Material properties GUI
    materialPropertiesFolder
      .add(sphereMaterial, "roughness")
      .min(0)
      .max(1)
      .step(0.001);
    materialPropertiesFolder
      .add(sphereMaterial, "metalness")
      .min(0)
      .max(1)
      .step(0.001);

    //Iridescence GUI
    iridescenceFolder
      .add(sphereMaterial, "iridescence")
      .min(0)
      .max(1)
      .step(0.0001);
    iridescenceFolder
      .add(sphereMaterial, "iridescenceIOR")
      .min(1)
      .max(2.333)
      .step(0.0001);
    iridescenceFolder
      .add(sphereMaterial.iridescenceThicknessRange, "1")
      .min(1)
      .max(1000)
      .step(1);

    //Transmission GUI
    transmissionFolder
      .add(sphereMaterial, "transmission")
      .min(0)
      .max(1)
      .step(0.0001);
    transmissionFolder.add(sphereMaterial, "ior").min(1).max(10).step(0.0001);
    transmissionFolder
      .add(sphereMaterial, "thickness")
      .min(0)
      .max(1)
      .step(0.0001);

    //Text
    const textGeometry1 = new TextGeometry("Valentina Restrepo Sanchez", {
      font: font,
      size: 0.5,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    });
    textGeometry1.center();

    const textGeometry2 = new TextGeometry("Creative developer", {
      font: font,
      size: 0.5,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    });
    textGeometry2.center();

    //Text
    const name = new THREE.Mesh(textGeometry1, material);
    const about = new THREE.Mesh(textGeometry2, material);
    about.position.y = -0.8;
    scene.add(name, about);

    //Sphere
    const sphere = new THREE.SphereGeometry(0.5, 32, 32);

    for (let i = 0; i < 800; i++) {
      const bubble = new THREE.Mesh(sphere, sphereMaterial);

      bubble.position.x = (Math.random() - 0.5) * 30;
      bubble.position.y = (Math.random() - 0.5) * 30;
      bubble.position.z = (Math.random() - 0.5) * 30;

      bubble.rotation.x = Math.random() * Math.PI;
      bubble.rotation.y = Math.random() * Math.PI;
      const scale = Math.random();
      bubble.scale.set(scale, scale, scale);

      scene.add(bubble);
      bubbles.push(bubble); // Store the reference
    }
  }
);

/**
 * Environmental map
 */
const rgbeLoader = new RGBELoader();
rgbeLoader.load("/textures/environmentMap/sky.hdr", (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = environmentMap;
  scene.environment = environmentMap;
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 1;
camera.position.y = 0.5;
camera.position.z = 6;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2.1;
controls.maxDistance = 15;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update bubble positions
  bubbles.forEach((bubble) => {
    bubble.position.y += Math.sin(elapsedTime + bubble.position.x) * 0.005;
    bubble.position.z += Math.sin(elapsedTime + bubble.position.x) * 0.005;
  });

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
