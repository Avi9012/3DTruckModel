import * as THREE from "three";
import { PIN_COLOR } from "./Constants";

export class CenterPin {
    private height: number;
    private pinMesh: THREE.Mesh;

    constructor(height:number) {
        this.height = height;
        this.pinMesh = this.createPin();
    }

    private createPin(): THREE.Mesh {
        const coneMesh = new THREE.Mesh(
            new THREE.ConeGeometry(this.height / 6, this.height * 5 / 6, 32),
            new THREE.MeshBasicMaterial({ color: PIN_COLOR })
        );
        coneMesh.position.setY(this.height * 5 / 12);
        coneMesh.rotateX(Math.PI);

        const sphereMesh = new THREE.Mesh(
            new THREE.SphereGeometry(coneMesh.geometry.parameters.radius, 32, 16, 0, Math.PI, 0, Math.PI),
            new THREE.MeshBasicMaterial({ color: PIN_COLOR })
        );

        sphereMesh.position.setY(-coneMesh.position.y);
        sphereMesh.rotateX(Math.PI / 2);
        coneMesh.add(sphereMesh);
        coneMesh.scale.set(0.8, 0.8, 0.8);
        return coneMesh;
    }

    public getPinMesh() {
        return this.pinMesh;
    }
}