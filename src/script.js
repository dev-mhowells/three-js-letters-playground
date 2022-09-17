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

// const originalPositionsX = ["0"];
const originalPositionsX = [];

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
        // originalPositionsX.push(letter.position.x);
      }
      // gen random values for each letter x,y,z
      randomVals.push(Math.random(), Math.random(), Math.random());
    });
    // find length of a group:
    const groupBoundingBox = new THREE.Box3().setFromObject(lettersGroup);

    // center group - PROBLEM HERE - DOESN'T CHANGE COORDS OF INDIVIDUAL MESHES
    const groupBoxLen = groupBoundingBox.max.x * 0.5;

    // move each letter -x depending on the lenght of the boundingbox of th group
    // this centers each letter instead of the group, which causes problems
    for (const letter of lettersGroup.children) {
      const centeredLetterX = letter.position.x - groupBoxLen;
      // add to original positions array which is used to place letters for animations
      originalPositionsX.push(centeredLetterX);
    }
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
scene.add(axesHelper);

// light
const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const pointLight = new THREE.PointLight();
pointLight.position.set(3, 3, 3);
scene.add(pointLight);

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
// camera.position.y = -5;
// camera.position.x = -1.34;
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

let toggler = false;

const clock = new THREE.Clock();
let previousTime = 0;

window.addEventListener("click", () => {
  toggler = !toggler;
  // reset clock/ elapsed time on each click
  clock.start();

  if (toggler === false) {
  }
  // elapsed time has to be longer than the duration of this animation for it to work
  lettersGroup.children.forEach((letter, i) => {
    gsap.to(letter.position, {
      duration: 0.5,
      ease: "power2.inOut",
      x: originalPositionsX[i],
      y: "0",
      z: "0",
    });
    gsap.to(letter.rotation, {
      duration: 0.5,
      x: "0",
      y: "0",
    });
  });
});

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;
  //   console.log(elapsedTime);
  let elapsedTimeMod = elapsedTime * 0.8;
  // test
  if (lettersGroup.children[0] && !toggler) {
    let radius = 3;

    lettersGroup.children.forEach(
      (letter, i) => {
        // here the final value originalPositionsX[i] is the radius, ensuring all letters
        // start at the correct position, based on their starting x position, which is now radius
        letter.position.x =
          Math.cos(-elapsedTimeMod * (randomVals[i] / 2)) *
          originalPositionsX[i];

        // if (i === 3) console.log(letter.position.x);
        letter.position.y = Math.sin(elapsedTime) * (randomVals[i + 1] / 2);

        letter.position.z =
          Math.sin(elapsedTimeMod * (randomVals[i + 3] / 2)) * radius;
        radius += 0.5;
        // if (i === 0) console.log(letter.position.z);
        letter.rotation.x = Math.sin(elapsedTime * randomVals[i]);
        letter.rotation.y = Math.cos(elapsedTime * randomVals[i + 1]);
      }
      //   {
      //     lettersGroup.children.forEach((letter, i) => {
      //       letter.position.x += deltaTime * 0.1;

      //       letter.position.y += deltaTime * 0.1;

      //       letter.position.z += deltaTime * 0.1;
      //       radius += 0.5;
      //     });
      //   }
    );
  }

  // update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
