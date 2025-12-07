import * as THREE from 'three/webgpu';

// Load environment map texture
const textureLoader = new THREE.TextureLoader();

export function loadEnvironmentMap(scene) {
  const envMapPath = '/spruit_sunrise_1k.jpg';

  textureLoader.load(envMapPath, (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.environment = texture;
    scene.environmentIntensity = 0.4;
  }, undefined, (error) => {
    console.error('Error loading environment map:', error);
  });
}
