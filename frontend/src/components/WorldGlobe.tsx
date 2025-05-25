/*  WorldGlobe.tsx
    -------------------------------------------------------------
    React-Three-Fiber globe with cyan coastlines, graticule and
    placeholder point cloud. Adapted from GlobeExperience.jsx.
*/

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as d3 from "d3-geo";
import { feature as topoFeature } from "topojson-client";
// world-atlas ships TopoJSON files; this one has a Topo object named "land"
import land110m from "world-atlas/land-110m.json";

const RADIUS = 1; // base sphere radius in world units
const THEME = {
  bg: "#1c1c1e",
  cyan: "#25d1e6",
  dot: "#ffffff",
  ink: "#0a0a0b",
};

function lonLatToXYZ([lon, lat]: [number, number], r: number = RADIUS) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return [
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

function Graticule() {
  const positions = useMemo(() => {
    const lines = d3.geoGraticule().step([15, 15]).lines();
    const pts: number[] = [];
    lines.forEach((line) => {
      const coords = line.coordinates as [number, number][];
      for (let i = 0; i < coords.length - 1; i++) {
        pts.push(...lonLatToXYZ(coords[i]));
        pts.push(...lonLatToXYZ(coords[i + 1]));
      }
    });
    return new Float32Array(pts);
  }, []);

  return (
    <lineSegments renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={["attributes", "position"]}
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={THEME.cyan}
        opacity={0.8}
        transparent
        linewidth={1}
      />
    </lineSegments>
  );
}

function Coastlines() {
  const positions = useMemo(() => {
    const land = topoFeature(land110m as any, (land110m as any).objects.land);
    const pts: number[] = [];
    (land as any).features.forEach((feat: any) => {
      const geoCoords =
        feat.geometry.type === "Polygon"
          ? [feat.geometry.coordinates]
          : feat.geometry.coordinates;
      geoCoords.forEach((poly: any) => {
        poly.forEach((ring: any) => {
          for (let i = 0; i < ring.length - 1; i++) {
            pts.push(...lonLatToXYZ(ring[i]));
            pts.push(...lonLatToXYZ(ring[i + 1]));
          }
        });
      });
    });
    return new Float32Array(pts);
  }, []);

  return (
    <lineSegments renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={["attributes", "position"]}
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={THEME.cyan} linewidth={1} />
    </lineSegments>
  );
}

function PointCloud({ count = 4000 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const x = RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = RADIUS * Math.sin(phi) * Math.sin(theta);
      const z = RADIUS * Math.cos(phi);
      arr.set([x, y, z], i * 3);
    }
    return arr;
  }, [count]);

  return (
    <points renderOrder={2}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={["attributes", "position"]}
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={THEME.dot}
        size={0.008}
        sizeAttenuation
        opacity={0.95}
        transparent
      />
    </points>
  );
}

function Poi({ lonLat }: { lonLat: [number, number] }) {
  const pos = useMemo(() => lonLatToXYZ(lonLat, RADIUS + 0.02), [lonLat]);
  return (
    <Billboard position={pos as [number, number, number]} renderOrder={3}>
      <mesh>
        <planeGeometry args={[0.07, 0.07]} />
        <meshBasicMaterial color={THEME.cyan} />
      </mesh>
      <Text color={THEME.ink} fontSize={0.04} anchorX="center" anchorY="middle">
        +
      </Text>
    </Billboard>
  );
}

function Globe() {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.1;
  });

  const pois: [number, number][] = [
    [-100, 50],
    [-60, -15],
    [140, 35],
  ];

  return (
    <group ref={ref}>
      <mesh visible={false}>
        <sphereGeometry args={[RADIUS, 32, 32]} />
        <meshBasicMaterial />
      </mesh>

      <Graticule />
      <Coastlines />
      <PointCloud />
      {pois.map((p, i) => (
        <Poi key={i} lonLat={p} />
      ))}
    </group>
  );
}

export default function WorldGlobe() {
  return (
    <div className="w-full h-full" style={{ background: THEME.bg }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 35 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <Globe />
        </Suspense>
      </Canvas>
    </div>
  );
}
