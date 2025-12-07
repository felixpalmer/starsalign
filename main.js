import * as THREE from 'three/webgpu';
import {pass} from 'three/tsl';
import {bloom} from 'three/addons/tsl/display/BloomNode.js';

import {store} from './src/store.js';
import {ANIMATION_DURATION, CLOTH_UPDATE_INTERVAL} from './src/config/constants.js';
import {easeInOutQuint, calculateVerticalFOV, calculateStaggeredProgress} from './src/utils.js';
import {setupLighting} from './src/scene/lighting.js';
import {createStarGroup} from './src/scene/starGroup.js';
import {FlagMesh} from './src/mesh/flag.js';
import {ControlSphereMesh} from './src/mesh/controlSphere.js';
import {loadEnvironmentMap} from './src/scene/environment.js';
import {initializeHUD, updateFPS, updateTimeCounter, updateBackendInfo} from './src/debug/hud.js';
import {setupClickHandler, setupRotationHandlers} from './src/events/interactions.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Calculate FOV to fit flag width based on aspect ratio
const aspectRatio = window.innerWidth / window.innerHeight;
const fov = calculateVerticalFOV(48, aspectRatio);

const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 50);
const renderer = new THREE.WebGPURenderer({alpha: false, antialias: false, forceWebGL: false, colorBufferType: THREE.HalfFloatType});
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create star group
const {starGroup, starData} = createStarGroup();
scene.add(starGroup);

// Create control sphere for rotation
const controlSphere = new ControlSphereMesh();
scene.add(controlSphere);

// Create flag background
const flagBackground = new FlagMesh();
scene.add(flagBackground);

// Setup lighting
setupLighting(scene);

// Position camera
camera.position.set(0, 0, 33);
camera.lookAt(0, 0, 0);

// WebGPU post-processing setup
const postProcessing = new THREE.PostProcessing(renderer);
const scenePass = pass(scene, camera);
const scenePassColor = scenePass.getTextureNode('output');
const bloomPass = bloom(scenePassColor);

bloomPass.threshold.value = 0.4;
bloomPass.strength.value = 0.15;
bloomPass.radius.value = 0.6;

postProcessing.outputNode = scenePassColor.add(bloomPass);

// Load environment map
loadEnvironmentMap(scene);

// Setup event handlers
setupClickHandler(camera, starGroup, flagBackground, controlSphere);
setupRotationHandlers(renderer);

// Initialize HUD
initializeHUD();

// Reusable objects for animation loop to avoid garbage collection
const _flagPos = new THREE.Vector3();
const _flagQuat = new THREE.Quaternion();
const _flagUp = new THREE.Vector3(0, 0, 1);
const _localPos = new THREE.Vector3();
const _dodecQuat = new THREE.Quaternion();

let lastTime = 0;

function animate(now) {
  requestAnimationFrame(animate);

  now = now || performance.now();

  const state = store.getState();

  // Calculate delta time in seconds
  const deltaTime = lastTime === 0 ? 0.016 : (now - lastTime) / 1000;
  lastTime = now;

  // Update HUD
  updateFPS(now);
  updateTimeCounter(now);

  // Simulate cloth physics
  flagBackground.updatePhysics(now, CLOTH_UPDATE_INTERVAL);

  // Update control sphere
  controlSphere.updateAutoRotation(deltaTime);
  controlSphere.updatePhysics();

  // Handle transition animation
  if (state.isAnimating) {
    const progressDelta = deltaTime / ANIMATION_DURATION;
    let newProgress = state.animationProgress;

    if (state.isDodecahedron) {
      newProgress += progressDelta;
      if (newProgress >= 1) {
        newProgress = 1;
        store.getState().setIsAnimating(false);
      }
    } else {
      newProgress -= progressDelta;
      if (newProgress <= 0) {
        newProgress = 0;
        store.getState().setIsAnimating(false);
      }
    }
    store.getState().setAnimationProgress(newProgress);

    // Animate stars
    for (let i = 0; i < starData.length; i++) {
      const data = starData[i];

      // Calculate flag position
      const clothData = flagBackground.getPositionAtUV(data.flagUV.u, data.flagUV.v);
      _flagPos.copy(clothData.position);
      _flagPos.z += 0.1;
      _flagQuat.setFromUnitVectors(_flagUp, clothData.normal);

      // Calculate dodecahedron position
      _localPos.copy(data.dodecahedronPos);
      _localPos.applyQuaternion(controlSphere.quaternion);
      _localPos.add(controlSphere.position);
      _dodecQuat.copy(controlSphere.quaternion).multiply(data.dodecahedronRot);

      // Stagger animation
      const localProgress = calculateStaggeredProgress(newProgress, data.staggerIndex, starData.length, 0.6);

      // Smooth easing
      const t = easeInOutQuint(localProgress);

      data.star.position.lerpVectors(_flagPos, _localPos, t);
      data.star.quaternion.slerpQuaternions(_flagQuat, _dodecQuat, t);
    }
  } else {
    // When not animating, use target position
    for (let i = 0; i < starData.length; i++) {
      const data = starData[i];

      if (state.isDodecahedron) {
        _localPos.copy(data.dodecahedronPos);
        _localPos.applyQuaternion(controlSphere.quaternion);
        _localPos.add(controlSphere.position);
        data.star.position.copy(_localPos);
        data.star.quaternion.copy(controlSphere.quaternion).multiply(data.dodecahedronRot);
      } else {
        const clothData = flagBackground.getPositionAtUV(data.flagUV.u, data.flagUV.v);
        _flagPos.copy(clothData.position);
        _flagPos.z += 0.1;
        data.star.position.copy(_flagPos);
        _flagQuat.setFromUnitVectors(_flagUp, clothData.normal);
        data.star.quaternion.copy(_flagQuat);
      }
    }
  }

  // Render
  postProcessing.render();
}

// Initialize WebGPU renderer before starting animation
renderer.init().then(() => {
  updateBackendInfo(renderer);
  animate();
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
