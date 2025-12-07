import * as THREE from 'three/webgpu';
import {SPRING_CONSTANTS, DAMPING_FACTOR} from '../config/constants.js';
import {store} from '../store.js';

export class ControlSphereMesh extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.SphereGeometry(2, 8, 6);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      visible: false
    });

    super(geometry, material);

    this.type = 'ControlSphereMesh';

    // Set initial position
    this.position.set(
      SPRING_CONSTANTS.sphereRestPosition.x,
      SPRING_CONSTANTS.sphereRestPosition.y,
      SPRING_CONSTANTS.sphereRestPosition.z
    );

    // Initialize target quaternion in store
    store.getState().targetQuaternion.copy(this.quaternion);
  }

  // Update sphere rotation and position physics
  updatePhysics() {
    const state = store.getState();

    // Apply damping - smoothly interpolate sphere rotation
    this.quaternion.slerp(state.targetQuaternion, DAMPING_FACTOR);

    // Update spring physics for sphere position
    const sphereRestPos = new THREE.Vector3(
      SPRING_CONSTANTS.sphereRestPosition.x,
      SPRING_CONSTANTS.sphereRestPosition.y,
      SPRING_CONSTANTS.sphereRestPosition.z
    );
    const displacement = new THREE.Vector3().subVectors(sphereRestPos, this.position);
    const springForce = displacement.multiplyScalar(SPRING_CONSTANTS.SPRING_STRENGTH);
    state.sphereVelocity.add(springForce);
    state.sphereVelocity.multiplyScalar(SPRING_CONSTANTS.SPRING_DAMPING);
    this.position.add(state.sphereVelocity);
  }

  // Handle auto-rotation
  updateAutoRotation(deltaTime) {
    const state = store.getState();

    if ((state.isDodecahedron || state.isAnimating) && state.autoRotateEnabled) {
      const autoRotateSpeed = 0.004 * (deltaTime / 0.016);
      const autoRotateEuler = new THREE.Euler(0, autoRotateSpeed, 0);
      const autoRotateQuat = new THREE.Quaternion().setFromEuler(autoRotateEuler);
      const newQuat = new THREE.Quaternion().multiplyQuaternions(autoRotateQuat, state.targetQuaternion);
      store.getState().setTargetQuaternion(newQuat);
    }
  }
}
