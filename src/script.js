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
 * Texture load
 */
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load("/textures/matcaps/8.png");
const particlesTexture = textureLoader.load("/textures/particles/star_07.png");

/**
 * Particles
 */
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.5,
  sizeAttenuation: true,
  alphaMap: particlesTexture,
  color: 0x5d546b,
  transparent: true,
  depthWrite: false,
});
particlesMaterial.blending = THREE.AdditiveBlending;
const particlesGeometry = new THREE.BufferGeometry();
const count = 2000;

const positions = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 12;
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
particles.position.z -= 3;
/**
 * Text
 */
const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
const lettersGroup = new THREE.Group();

function itemiseText(str) {
  return str.split("");
}
const letterArr = itemiseText("Michael");

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
  "fonts/gentilis_bold.typeface.json",
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
scene.add(particles);
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

// CHANGE TOGGLER TO FALSE - UNCOMMENT EVENT LISTENER BELOW
let toggler = false;

const clock = new THREE.Clock();
// let previousTime = 0;

window.addEventListener("click", () => {
  toggler = !toggler;
  // reset clock/ elapsed time on each click
  clock.start();

  // spread letters in fist instance
  //   if (toggler === false) {
  //     lettersGroup.children.forEach((letter, i) => {
  //       const newX = String(originalPositionsX[i] * 2);
  //       gsap.to(letter.position, {
  //         duration: 0.2,
  //         ease: "power2.inOut",
  //         x: newX,
  //         y: "0",
  //         z: "0",
  //       });
  //       //   gsap.to(letter.rotation, {
  //       //     duration: 0.5,
  //       //     x: "0",
  //       //     y: "0",
  //       //   });
  //     });
  //   }
  if (toggler === true) {
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
  }
});

// Paralax
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // paralax
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  const parallaxX = cursor.x;
  const parallaxY = -cursor.y;
  camera.position.x += (parallaxX - camera.position.x) * 0.1;
  camera.position.y += (parallaxY - camera.position.y) * 0.1;

  // animate particles
  //   particles.position.x = Math.sin(elapsedTime * 0.2);
  //   particles.position.z = Math.cos(elapsedTime * 0.2);

  // animate letters
  let elapsedTimeMod = elapsedTime * 0.8;
  // test
  if (lettersGroup.children[0] && !toggler) {
    let radius = 3;

    // manages initial expansion of radius. returned value is multiplied by
    // original x position in order to manage radius of lettering and ensure it
    // originates at each letter's original position but expands to 2x that.
    function xRadius(elapsedTime) {
      if (elapsedTime < 1) {
        return elapsedTime + 1;
      } else if (elapsedTime > 1) {
        return 2;
      }
    }

    lettersGroup.children.forEach((letter, i) => {
      // here the final value originalPositionsX[i] is the radius, ensuring all letters
      // start at the correct position, based on their starting x position, which is now radius
      letter.position.x =
        Math.cos(-elapsedTimeMod * (randomVals[i] / 2)) *
        (originalPositionsX[i] * xRadius(elapsedTime));

      letter.position.y = Math.sin(elapsedTime) * (randomVals[i + 1] / 2);

      letter.position.z =
        Math.sin(elapsedTimeMod * (randomVals[i + 3] / 2)) * radius;
      radius += 0.5;

      letter.rotation.x = Math.sin(elapsedTime * randomVals[i]);
      letter.rotation.y = Math.cos(elapsedTime * randomVals[i + 1]);
    });
  }

  // update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
