import * as THREE from 'three/webgpu';

// Load metal textures
const textureLoader = new THREE.TextureLoader();
const metalNormal = textureLoader.load('/metal_12-1K/metal_12_normal-1K.jpg');
const metalRoughness = textureLoader.load('/metal_12-1K/metal_12_roughness-1K.png');

// Load environment map
const envMap = textureLoader.load('/spruit_sunrise_1k.jpg', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
});

export const GoldMaterial = new THREE.MeshStandardMaterial({
  color: 0xFFCC00, // EU flag yellow
  side: THREE.DoubleSide,
  normalMap: metalNormal,
  normalScale: new THREE.Vector2(0.6, 0.6),
  roughnessMap: metalRoughness,
  metalness: 0.8,
  roughness: 0.5,
  envMap: envMap,
  envMapIntensity: 1.5,
});
