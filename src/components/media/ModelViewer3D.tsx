import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  Center,
  OrbitControls,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import type { ModelSettings } from "./types";

function Model({ src }: { src: string }) {
  const { scene, animations } = useGLTF(src);
  const { actions } = useAnimations(animations, scene);

  // Redă automat toate animațiile din GLB (dacă există).
  useEffect(() => {
    Object.values(actions).forEach((action) => action?.play());
  }, [actions]);

  return <primitive object={scene} />;
}

interface ModelViewer3DProps {
  src: string;
  settings?: ModelSettings;
}

export default function ModelViewer3D({ src, settings }: ModelViewer3DProps) {
  const {
    autoRotate = true,
    autoRotateSpeed = 0.5,
    minDistance = 0.5,
    maxDistance = 15,
  } = settings ?? {};

  return (
    <Canvas camera={{ position: [2.5, 1.6, 2.5], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 6, 4]} intensity={1.4} />
      <directionalLight position={[-4, 2, -5]} intensity={0.5} />
      <Suspense fallback={null}>
        {/* Bounds auto-încadrează camera pe model; Center îl aduce în origine */}
        <Bounds fit clip observe margin={1.25}>
          <Center>
            <Model src={src} />
          </Center>
        </Bounds>
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        minDistance={minDistance}
        maxDistance={maxDistance}
      />
    </Canvas>
  );
}
