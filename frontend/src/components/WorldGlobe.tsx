import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Vector3,
  BufferGeometry,
  LineSegments,
  Float32BufferAttribute,
} from "three";

const radius = 0.8;
const bgColor = "var(--thunder-900)";

const continents: [number, number][][] = [
  [
    [-130, 25],
    [-60, 50],
    [-100, 80],
    [-160, 60],
    [-130, 25],
  ],
  [
    [-70, 10],
    [-40, -10],
    [-50, -60],
    [-80, -50],
    [-70, 10],
  ],
  [
    [-10, 50],
    [30, 70],
    [100, 60],
    [140, 50],
    [120, 20],
    [60, 30],
    [0, 40],
    [-10, 50],
  ],
  [
    [-20, 35],
    [20, 30],
    [40, 15],
    [50, -35],
    [20, -35],
    [-10, 0],
    [-20, 35],
  ],
  [
    [110, -10],
    [155, -10],
    [150, -45],
    [110, -40],
    [110, -10],
  ],
];

function project([lon, lat]: [number, number]) {
  const phi = (lat * Math.PI) / 180;
  const theta = (lon * Math.PI) / 180;
  const x = radius * Math.cos(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi);
  const z = -radius * Math.cos(phi) * Math.sin(theta);
  return new Vector3(x, y, z);
}

function Continents() {
  const positions: number[] = [];
  continents.forEach((coords) => {
    for (let i = 0; i < coords.length - 1; i++) {
      const a = project(coords[i]);
      const b = project(coords[i + 1]);
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  });
  const geom = new BufferGeometry();
  geom.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return (
    <lineSegments geometry={geom} renderOrder={1}>
      <lineBasicMaterial color="#ffffff" linewidth={1} />
    </lineSegments>
  );
}

interface DragInfo {
  dragging: boolean;
  lastX: number;
  velocity: number;
  group: THREE.Group | null;
}

function Globe({ info }: { info: React.MutableRefObject<DragInfo> }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!info.current.dragging && groupRef.current) {
      groupRef.current.rotation.y += info.current.velocity;
      info.current.velocity *= 0.95;
    }
  });
  info.current.group = groupRef.current;
  return (
    <group ref={groupRef}>
      <mesh renderOrder={0}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color={bgColor} wireframe />
      </mesh>
      <Continents />
    </group>
  );
}

export default function WorldGlobe() {
  const drag = useRef<DragInfo>({
    dragging: false,
    lastX: 0,
    velocity: 0,
    group: null,
  });

  const onPointerDown = (e: any) => {
    drag.current.dragging = true;
    drag.current.lastX = e.clientX;
    drag.current.velocity = 0;
  };
  const onPointerMove = (e: any) => {
    if (!drag.current.dragging || !drag.current.group) return;
    const dx = e.clientX - drag.current.lastX;
    const rot = dx * 0.005;
    drag.current.group.rotation.y += rot;
    drag.current.velocity = rot;
    drag.current.lastX = e.clientX;
  };
  const endDrag = () => {
    drag.current.dragging = false;
  };

  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 35 }}
      gl={{ antialias: true, alpha: false }}
      style={{
        background: bgColor,
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <Globe info={drag} />
    </Canvas>
  );
}
