import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

export default function BuildingAMap() {
  const map = useGLTF("./BuildingA.glb");
  useEffect(() => {
    map.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [map]);

  return <primitive scale={1.0} object={map.scene}  position={[10, -2, 0]}/>;
}

useGLTF.preload("./BuildingA.glb");