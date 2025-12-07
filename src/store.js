import {createStore} from 'zustand/vanilla';
import * as THREE from 'three/webgpu';

export const store = createStore((set) => ({
  // Animation state
  isDodecahedron: false,
  isAnimating: false,
  animationProgress: 0,
  setIsDodecahedron: (value) => set({isDodecahedron: value}),
  setIsAnimating: (value) => set({isAnimating: value}),
  setAnimationProgress: (value) => set({animationProgress: value}),

  // Rotation state
  isDragging: false,
  hasDragged: false,
  previousMouseX: 0,
  previousMouseY: 0,
  targetQuaternion: new THREE.Quaternion(),
  autoRotateEnabled: true,
  setIsDragging: (value) => set({isDragging: value}),
  setHasDragged: (value) => set({hasDragged: value}),
  setPreviousMouse: (x, y) => set({previousMouseX: x, previousMouseY: y}),
  setTargetQuaternion: (quat) => set({targetQuaternion: quat}),
  setAutoRotateEnabled: (value) => set({autoRotateEnabled: value}),

  // Physics state
  sphereVelocity: new THREE.Vector3(0, 0, 0),
  windImpulses: [],
  addWindImpulse: (impulse) => set((state) => ({
    windImpulses: [...state.windImpulses, impulse]
  })),
  setWindImpulses: (impulses) => set({windImpulses: impulses}),


  // Timing state
  lastClothUpdate: 0,
  setLastClothUpdate: (time) => set({lastClothUpdate: time}),
}));
