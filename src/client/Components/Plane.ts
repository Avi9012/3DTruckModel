import * as THREE from "three";
import { PLANE_COLOR } from "./Constants";

export const Plane = () => {
    const geometry = new THREE.PlaneGeometry(1000, 1000);
    const material = new THREE.MeshPhongMaterial({ color: PLANE_COLOR });
    const plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.castShadow = true
    return plane;
}