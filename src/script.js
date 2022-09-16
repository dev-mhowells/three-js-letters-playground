import "./style.css";
import * as THREE from "three";
import * as dat from "lil-gui";
import { OrbitControls } from "/node_modules/three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import gsap from "gsap";

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  shapeComplexity: 0,
  icosMaterialColor: 0xa06464,
};

const axesHelper = new THREE.AxesHelper();

/**
 * Text
 */
const textMaterial = new THREE.MeshNormalMaterial();
const lettersGroup = new THREE.Group();

function itemiseText(str) {
  return str.split("");
}
const letterArr = itemiseText("Letters");

// spacing
let distanceBetween = 0.1;
const wordStartX = 0;
// let placeNextLetterX = 0;
const randomVals = [];

const originalPositionsX = ["0"];

/**
 * FONT LOADER
 */
const fontLoader = new FontLoader();

fontLoader.load(
  // source
  "fonts/helvetiker_bold.typeface.json",
  (font) => {
    // CREATE ALL LETTERS
    letterArr.forEach((element, i) => {
      // GEOMETRY
      const textGeometry = new TextGeometry(element, {
        font: font,
        size: 0.5,
        height: 0.3,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 3,
      });
      const letter = new THREE.Mesh(textGeometry, textMaterial);

      // needed to calc letter width
      textGeometry.computeBoundingBox();

      // stores total word length so far -- before adding current letter
      let totalWordLength = 0;
      // gets total word length so far from width of each letter plus distance between letters
      if (lettersGroup.children[0]) {
        for (let letterObj of lettersGroup.children) {
          totalWordLength +=
            letterObj.geometry.boundingBox.max.x + distanceBetween;
        }
      }

      lettersGroup.add(letter);
      //   console.log(letter);

      // calc position x for letters after the first
      if (i > 0) {
        // placeNextLetterX = wordStartX + totalWordLength;
        letter.position.x = wordStartX + totalWordLength;
        originalPositionsX.push(letter.position.x);
      }
      // gen random values for each letter x,y,z
      randomVals.push(Math.random(), Math.random(), Math.random());
    });
  }
);

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.add(lettersGroup);

// light
const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const pointLight = new THREE.PointLight();
pointLight.position.set(3, 3, 3);
scene.add(pointLight);

// // Material
// let normalMaterial = new THREE.MeshNormalMaterial({});

// /**
//  * Icos
//  */
// let icosGeometry = new THREE.IcosahedronGeometry(1, parameters.shapeComplexity);
// let icos = new THREE.Mesh(icosGeometry, normalMaterial);

// scene.add(icos);
// /**
//  * Dodec
//  */

// const dodec = new THREE.Mesh(new THREE.DodecahedronGeometry(), normalMaterial);
// dodec.position.x = 2;
// scene.add(dodec);

// /**
//  * Octa
//  */
// const octa = new THREE.Mesh(new THREE.OctahedronGeometry(), normalMaterial);
// octa.position.x = -2;
// scene.add(octa);

// const shapesArray = [icos, dodec, octa];
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
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 10;
camera.position.y = -5;
camera.position.x = 2;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Controls
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

/**
 * Animate
 */

let toggler = true;

window.addEventListener("click", () => {
  toggler = !toggler;
  console.log(lettersGroup.children[0].position);

  lettersGroup.children.forEach((letter, i) => {
    gsap.to(letter.position, {
      duration: 1.5,
      ease: "power2.inOut",
      x: originalPositionsX[i],
      y: "0",
      z: "0",
    });
    gsap.to(letter.rotation, {
      duration: 1.5,
      x: "0",
      y: "0",
    });
  });
});

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  let elapsedTimeMod = elapsedTime * 0.8;
  // test
  if (lettersGroup.children[0] && !toggler) {
    let radius = 3;

    lettersGroup.children.forEach((letter, i) => {
      //   if (i % 2 === 0) elapsedTime = -elapsedTime;

      letter.position.x =
        Math.cos(elapsedTimeMod * (randomVals[i + 1] / 2)) * radius;

      letter.position.y = Math.sin(elapsedTime) * (randomVals[i] / 2);

      letter.position.z =
        Math.sin(elapsedTimeMod * (randomVals[i + 3] / 2)) * radius;
      radius += 0.5;

      letter.rotation.x = elapsedTime * randomVals[i];
      letter.rotation.y = elapsedTime * randomVals[i + 1];
    });
  }

  //animate shapes
  //   const shape1Angle = elapsedTime * 0.5;
  //   shapesArray[0].position.x = Math.cos(shape1Angle) * 6;
  //   shapesArray[0].position.z = Math.sin(shape1Angle) * 6;
  //   shapesArray[0].position.y = Math.sin(elapsedTime) * 2.5;
  //   shapesArray[0].rotation.x = elapsedTime * 0.2;
  //   shapesArray[0].rotation.y = elapsedTime * 0.5;

  //   const shape2Angle = elapsedTime * 0.3;
  //   shapesArray[1].position.x = -Math.cos(shape2Angle) * 4;
  //   shapesArray[1].position.z = Math.sin(shape2Angle) * 4;
  //   shapesArray[1].position.y = Math.sin(elapsedTime) * 1.75;
  //   shapesArray[1].rotation.x = elapsedTime * 0.3;
  //   shapesArray[1].rotation.y = elapsedTime * 0.6;

  //   const shape3Angle = -elapsedTime * 0.3;
  //   shapesArray[2].position.x = Math.cos(shape3Angle) * 2;
  //   shapesArray[2].position.z = Math.sin(shape3Angle) * 2;
  //   shapesArray[2].position.y = Math.sin(elapsedTime) * 1;
  //   shapesArray[2].rotation.x = elapsedTime * 0.4;
  //   shapesArray[2].rotation.y = elapsedTime * 0.7;

  // update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
