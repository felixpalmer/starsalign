import * as THREE from 'three/webgpu';
import {store} from '../store.js';

export function setupClickHandler(camera, starGroup, flagBackground, controlSphere) {
  document.addEventListener('click', (e) => {
    const state = store.getState();

    // Don't toggle if user was dragging
    if (state.hasDragged) {
      store.getState().setHasDragged(false);
      return;
    }

    // Convert click position to 3D world coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // If in dodecahedron mode, apply sphere push and transition back to flag
    if (state.isDodecahedron || state.isAnimating) {
      // Check if a star was clicked to apply push impulse
      const starIntersects = raycaster.intersectObjects(starGroup.children);
      if (starIntersects.length > 0) {
        const {point} = starIntersects[0];
        const worldNormal = point.sub(controlSphere.position);
        const PUSH_STRENGTH = 0.015;
        state.sphereVelocity.add(worldNormal.multiplyScalar(-PUSH_STRENGTH));
      }

      // Transition back to flag
      store.getState().setIsDodecahedron(false);
      store.getState().setIsAnimating(true);
      store.getState().setAutoRotateEnabled(true);
      return;
    }

    // Check if click intersects the flag
    const flagIntersects = raycaster.intersectObject(flagBackground);

    if (flagIntersects.length === 0) {
      return;
    }

    // Get the intersection point for wind impulse
    const clickPoint = flagIntersects[0].point;

    // Add wind impulse at click location
    store.getState().addWindImpulse({
      position: clickPoint.clone(),
      strength: 20,
      radius: 25,
      decay: 0.8,
      startTime: performance.now()
    });

    // Toggle to dodecahedron mode
    store.getState().setIsDodecahedron(true);
    store.getState().setIsAnimating(true);
    store.getState().setAutoRotateEnabled(true);
  });
}

export function setupRotationHandlers(renderer) {
  const handleMouseDown = (e) => {
    store.getState().setIsDragging(true);
    store.getState().setHasDragged(false);
    store.getState().setPreviousMouse(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    const state = store.getState();
    if (!state.isDragging) return;

    const deltaX = e.clientX - state.previousMouseX;
    const deltaY = e.clientY - state.previousMouseY;

    if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
      store.getState().setHasDragged(true);
      store.getState().setAutoRotateEnabled(false);
    }

    // Trackball-style rotation
    const rotationSpeed = 5.0;
    const normalizedDeltaX = deltaX / window.innerWidth;
    const normalizedDeltaY = deltaY / window.innerHeight;

    const deltaRotationQuaternion = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(
        normalizedDeltaY * rotationSpeed,
        normalizedDeltaX * rotationSpeed,
        0,
        'XYZ'
      ));

    const newQuat = new THREE.Quaternion().multiplyQuaternions(
      deltaRotationQuaternion,
      state.targetQuaternion
    );
    store.getState().setTargetQuaternion(newQuat);
    store.getState().setPreviousMouse(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    store.getState().setIsDragging(false);
  };

  // Touch events
  const handleTouchStart = (e) => {
    store.getState().setIsDragging(true);
    store.getState().setHasDragged(false);
    store.getState().setPreviousMouse(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    const state = store.getState();
    if (!state.isDragging) return;
    e.preventDefault();

    const deltaX = e.touches[0].clientX - state.previousMouseX;
    const deltaY = e.touches[0].clientY - state.previousMouseY;

    if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
      store.getState().setHasDragged(true);
      store.getState().setAutoRotateEnabled(false);
    }

    const rotationSpeed = 5.0;
    const normalizedDeltaX = deltaX / window.innerWidth;
    const normalizedDeltaY = deltaY / window.innerHeight;

    const deltaRotationQuaternion = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(
        normalizedDeltaY * rotationSpeed,
        normalizedDeltaX * rotationSpeed,
        0,
        'XYZ'
      ));

    const newQuat = new THREE.Quaternion().multiplyQuaternions(
      deltaRotationQuaternion,
      state.targetQuaternion
    );
    store.getState().setTargetQuaternion(newQuat);
    store.getState().setPreviousMouse(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    store.getState().setIsDragging(false);
  };

  renderer.domElement.addEventListener('mousedown', handleMouseDown);
  renderer.domElement.addEventListener('mousemove', handleMouseMove);
  renderer.domElement.addEventListener('mouseup', handleMouseUp);
  renderer.domElement.addEventListener('touchstart', handleTouchStart);
  renderer.domElement.addEventListener('touchmove', handleTouchMove);
  renderer.domElement.addEventListener('touchend', handleTouchEnd);
}

