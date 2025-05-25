import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  SphereGeometry,
  MeshBasicMaterial,
  Vector3,
  BufferGeometry,
  LineBasicMaterial,
  LineSegments,
  Float32BufferAttribute,
} from "three";
import { geoGraticule } from "d3-geo";

const theme = {
  colors: {
    bg: "#1c1c1e",
    fg: "#ffffff",
    cyan: "#25d1e6",
    ink: "#0a0a0b",
  },
};

const radius = 1;

function Graticule() {
  const lines = geoGraticule().step([15, 15])();
  const positions: number[] = [];

  lines.coordinates.forEach((multi) => {
    multi.forEach((coords) => {
      for (let i = 0; i < coords.length - 1; i++) {
        const a = project(coords[i]);
        const b = project(coords[i + 1]);
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    });
  });

  const geom = new BufferGeometry();
  geom.setAttribute("position", new Float32BufferAttribute(positions, 3));

  return (
    <lineSegments geometry={geom} renderOrder={1}>
      <lineBasicMaterial color={theme.colors.cyan} linewidth={0.5} />
    </lineSegments>
  );
}

function project([lon, lat]: [number, number]) {
  const phi = (lat * Math.PI) / 180;
  const theta = (lon * Math.PI) / 180;
  const x = radius * Math.cos(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi);
  const z = -radius * Math.cos(phi) * Math.sin(theta);
  return new Vector3(x, y, z);
}

export default function WorldGlobe() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 35 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: theme.colors.bg }}
    >
      <group ref={groupRef}>
        {/* Placeholder sphere */}
        <mesh renderOrder={0}>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshBasicMaterial color={theme.colors.bg} />
        </mesh>
        <Graticule />
        {/* TODO: add coastlines, point cloud and POIs */}
      </group>
    </Canvas>
  );
}
