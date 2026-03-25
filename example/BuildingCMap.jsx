import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

export default function BuildingCMap() {
  const map = useGLTF("./BuildingC.glb");
  useEffect(() => {
    map.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.side = THREE.DoubleSide;
          if (child.material.map) child.material.map.colorSpace = THREE.SRGBColorSpace;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [map]);

  return <primitive scale={1.0} object={map.scene}  position={[10, -2, 0]}/>;
}

useGLTF.preload("./BuildingC.glb");
