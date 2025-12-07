import * as THREE from 'three/webgpu';
import {STAR_ROTATION} from '../config/constants.js';

export class StarGeometry extends THREE.ExtrudeGeometry {
  constructor(
    outerRadius = 1,
    innerRadius = 0.382,
    points = 5,
    rotation = STAR_ROTATION,
    extrudeSettings = { depth: 0.05, bevelEnabled: false }
  ) {
    const shape = StarGeometry.createStarShape(outerRadius, innerRadius, points, rotation);
    super(shape, extrudeSettings);
    this.type = 'StarGeometry';
  }

  static createStarShape(outerRadius, innerRadius, points, rotation) {
    const shape = new THREE.Shape();

    for (let j = 0; j < points; j++) {
      const outerAngle = rotation + (j * Math.PI * 2) / points;
      const innerAngle = rotation + ((j + 0.5) * Math.PI * 2) / points;

      const outerX = outerRadius * Math.cos(outerAngle);
      const outerY = outerRadius * Math.sin(outerAngle);
      const innerX = innerRadius * Math.cos(innerAngle);
      const innerY = innerRadius * Math.sin(innerAngle);

      if (j === 0) {
        shape.moveTo(outerX, outerY);
      } else {
        shape.lineTo(outerX, outerY);
      }
      shape.lineTo(innerX, innerY);
    }
    shape.closePath();

    return shape;
  }
}
