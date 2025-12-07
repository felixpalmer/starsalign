import * as THREE from 'three/webgpu';
import {STAR_ROTATION} from '../config/constants.js';
import {StarGeometry} from '../geometry/star.js';
import {GoldMaterial} from '../material/gold.js';

export class StarMesh extends THREE.Mesh {
  constructor(radius) {
    // Fixed star parameters
    const outerRadius = radius;
    const innerRadius = 0.382 * radius;
    const points = 5;
    const rotation = STAR_ROTATION;
    const extrude = { depth: 0.05, bevelEnabled: false };

    const geometry = new StarGeometry(outerRadius, innerRadius, points, rotation, extrude);

    // Generate proper UVs based on star's circular layout
    const uvAttribute = geometry.attributes.uv;
    const posAttribute = geometry.attributes.position;

    // Star is laid out in a circle with radius R, so we can map x,y to UVs
    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const y = posAttribute.getY(i);

      // Map from circular coordinates (-R to +R) to UV space (0 to 1)
      // Normalize based on star radius
      const u = (x / outerRadius) * 0.5 + 0.5;
      const v = (y / outerRadius) * 0.5 + 0.5;

      uvAttribute.setXY(i, u, v);
    }
    uvAttribute.needsUpdate = true;

    // Copy UV to UV2 for aoMap
    geometry.setAttribute('uv2', uvAttribute.clone());

    super(geometry, GoldMaterial);

    this.type = 'StarMesh';
    this.castShadow = true;
    this.receiveShadow = true;
  }
}
