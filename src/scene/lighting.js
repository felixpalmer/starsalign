import * as THREE from 'three/webgpu';

// Helper function to configure shadow settings
function configureShadow(light) {
  light.castShadow = true;
  light.shadow.mapSize.width = 512;
  light.shadow.mapSize.height = 512;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 50;
  light.shadow.radius = 1;
  light.shadow.bias = -0.005;
}

export function setupLighting(scene) {
  // Ambient light for base illumination
  const ambientLight = new THREE.AmbientLight(0x00ffff, 0.4);
  scene.add(ambientLight);

  // Spotlight for shadows with perspective
  const spotLight = new THREE.SpotLight(0xffffff, 6.0);
  spotLight.position.set(0, 0, 29);
  spotLight.target.position.set(0, 0, 0);
  scene.add(spotLight.target);
  spotLight.angle = Math.PI / 3;
  spotLight.penumbra = 0.995;
  spotLight.decay = 1;
  spotLight.distance = 0;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 512;
  spotLight.shadow.mapSize.height = 512;
  spotLight.shadow.camera.near = 0.5;
  spotLight.shadow.camera.far = 60;
  spotLight.shadow.camera.fov = 60;
  spotLight.shadow.radius = 2;
  spotLight.shadow.bias = -0.005;
  scene.add(spotLight);

  // Rim lights from all sides to highlight cloth details
  const rimLights = [
    {color: 0xfff5e6, position: [0, 10, -5], name: 'top'},
    {color: 0xffeedd, position: [0, -10, -5], name: 'bottom'},
    {color: 0xfff8f0, position: [-10, 0, -5], name: 'left'},
    {color: 0xffe4cc, position: [10, 0, -5], name: 'right'}
  ];

  rimLights.forEach(config => {
    const light = new THREE.DirectionalLight(config.color, 1.0);
    light.position.set(...config.position);
    configureShadow(light);
    scene.add(light);
  });

  return {spotLight};
}
