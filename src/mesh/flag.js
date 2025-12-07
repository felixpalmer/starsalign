import * as THREE from 'three/webgpu';
import {ParametricGeometry} from 'three/examples/jsm/geometries/ParametricGeometry.js';
import {CLOTH_CONFIG, CLOTH_PARAMS} from '../config/constants.js';
import {Cloth, clothFunc, createEdgeIndices, getClothPositionAtUV} from '../physics/Cloth.js';
import {simulateCloth} from '../physics/clothSimulation.js';
import {FabricMaterial} from '../material/fabric.js';
import {store} from '../store.js';

export class FlagMesh extends THREE.Mesh {
  constructor() {
    // Create parametric geometry using cloth function
    const geometry = new ParametricGeometry(clothFunc, CLOTH_CONFIG.ySegs, CLOTH_CONFIG.xSegs);

    // Copy UV to UV2 for aoMap
    geometry.setAttribute('uv2', geometry.attributes.uv.clone());

    super(geometry, FabricMaterial);

    this.type = 'FlagMesh';
    this.position.z = -0.5; // Behind the stars
    this.receiveShadow = true;

    // Create internal cloth physics
    this.cloth = new Cloth(CLOTH_CONFIG.ySegs, CLOTH_CONFIG.xSegs, CLOTH_PARAMS.MASS);
    this.edgeIndices = createEdgeIndices(this.cloth);
  }

  // Update cloth physics simulation
  updatePhysics(now, CLOTH_UPDATE_INTERVAL) {
    const state = store.getState();

    if (now - state.lastClothUpdate >= CLOTH_UPDATE_INTERVAL) {
      simulateCloth(
        this.cloth,
        this.geometry,
        this.edgeIndices,
        state.windImpulses,
        CLOTH_PARAMS,
        now,
        (now - state.lastClothUpdate) / 1000
      );
      store.getState().setLastClothUpdate(now);

      // Update and remove old wind impulses
      const updatedImpulses = state.windImpulses.filter(impulse => {
        const elapsedTime = now - impulse.startTime;
        impulse.strength = 20 * Math.pow(impulse.decay, elapsedTime / 16.67);
        return elapsedTime <= 1000 && impulse.strength >= 0.1;
      });
      store.getState().setWindImpulses(updatedImpulses);
    }
  }

  // Get position and normal at UV coordinates for star positioning
  getPositionAtUV(u, v) {
    return getClothPositionAtUV(this.cloth, u, v);
  }
}
