import * as THREE from 'three/webgpu';

// Load fabric textures
const textureLoader = new THREE.TextureLoader();
const fabricNormal = textureLoader.load('/fabric_199-1K/fabric_199_Normal-1K.jpg');
const fabricRoughness = textureLoader.load('/fabric_199-1K/fabric_199_Roughness-1K.png');
const fabricAO = textureLoader.load('/fabric_199-1K/fabric_199_AmbientOcclusion-1K.jpg');
const fabricHeight = textureLoader.load('/fabric_199-1K/fabric_199_Height-1K.jpg');

// Set fabric texture wrapping and repeat
[fabricNormal, fabricRoughness, fabricAO, fabricHeight].forEach(texture => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1);
});

export const FabricMaterial = new THREE.MeshStandardMaterial({
  color: 0x004fff,
  normalMap: fabricNormal,
  normalScale: new THREE.Vector2(1.5, 1.5),
  aoMap: fabricAO,
  aoMapIntensity: 0.5,
  displacementMap: fabricHeight,
  displacementScale: 0.02,
  metalness: 0.0,
  side: THREE.DoubleSide,
});
