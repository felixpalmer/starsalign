import {store} from '../store.js';

// Setup slider controls
export function setupControls(cloth) {
  const dampingSlider = document.getElementById('damping');
  const dampingValue = document.getElementById('dampingValue');
  dampingSlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    store.getState().updateClothParam('DAMPING', value);
    dampingValue.textContent = value.toFixed(2);
  });

  const massSlider = document.getElementById('mass');
  const massValue = document.getElementById('massValue');
  massSlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    store.getState().updateClothParam('MASS', value);
    massValue.textContent = value.toFixed(1);
    // Update mass for all particles
    cloth.particles.forEach(p => {
      p.mass = value;
      p.invMass = 1 / value;
    });
  });

  const gravitySlider = document.getElementById('gravity');
  const gravityValue = document.getElementById('gravityValue');
  gravitySlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    store.getState().updateClothParam('GRAVITY', value);
    gravityValue.textContent = value.toFixed(2);
  });

  const windStrengthSlider = document.getElementById('windStrength');
  const windStrengthValue = document.getElementById('windStrengthValue');
  windStrengthSlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    store.getState().updateClothParam('WIND_STRENGTH', value);
    windStrengthValue.textContent = value.toFixed(1);
  });

  const windSpeedSlider = document.getElementById('windSpeed');
  const windSpeedValue = document.getElementById('windSpeedValue');
  windSpeedSlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    store.getState().updateClothParam('WIND_SPEED', value);
    windSpeedValue.textContent = value.toFixed(1);
  });

  const constraintIterSlider = document.getElementById('constraintIter');
  const constraintIterValue = document.getElementById('constraintIterValue');
  constraintIterSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    store.getState().updateClothParam('CONSTRAINT_ITERATIONS', value);
    constraintIterValue.textContent = value;
  });

  const cornerForceSlider = document.getElementById('cornerForce');
  const cornerForceValue = document.getElementById('cornerForceValue');
  cornerForceSlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    store.getState().updateClothParam('CORNER_FORCE_STRENGTH', value);
    cornerForceValue.textContent = value.toFixed(1);
  });
}
