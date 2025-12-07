# EU Stars Align

![EU Stars Align Preview](stars-align-preview.png)

An interactive 3D visualization exploring the transformation between the [Flag of Europe](https://en.wikipedia.org/wiki/Flag_of_Europe) and a dodecahedron - a platonic solid with 12 pentagonal faces. Created to commemorate 70 years since the adoption of the flag.

## Features

- **Interactive transformation** - Click to animate between flat and spherical arrangements
- **Real-time cloth physics** - Dynamic fabric simulation with wind effects
- **3D rotation** - Drag to rotate the geometric form
- **WebGPU rendering** - Hardware-accelerated graphics with post-processing effects
- **Responsive design** - Works on desktop and mobile devices

## Built With

### Core Technologies
- [Three.js](https://threejs.org/) - 3D graphics library with WebGPU support
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [Zustand](https://github.com/pmndrs/zustand) - State management

### Rendering & Effects
- WebGPU renderer with bloom post-processing
- Real-time cloth physics simulation
- PBR (Physically Based Rendering) materials
- Environment mapping and shadow mapping

### Textures & Assets
- Fabric textures: [Fabric-199](https://www.sharetextures.com/textures/fabric/fabric-199) (ShareTextures.com)
- Metal textures: [Metal-12](https://www.sharetextures.com/textures/metal/metal-12) (ShareTextures.com)
- Environment map: [Spruit Sunrise](https://polyhaven.com/a/spruit_sunrise) (Poly Haven)

## Development

```bash
# Install dependencies
yarn install

# Start dev server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Lint code
yarn lint
```

## License

MIT
