import * as THREE from "three";
import { HEAD_LIGHT_COLOR, TRUCK_BODY_COLOR, TRUCK_CABIN_COLOR, WHEEL_COLOR } from "./Constants";
import { CenterPin } from "./CenterPin";

type WheelDimentions = {
    r: number,
    l: number
}

export class Truck {

    private moveable: boolean;
    private truckMesh: THREE.Mesh;
    private pivotPos: THREE.Vector3;

    constructor() {
        this.moveable = false;
        this.truckMesh = this.createTruckMesh();
        this.pivotPos = new THREE.Vector3(0, this.truckMesh.position.y, 0);
        this.truckMesh.lookAt(this.pivotPos);
    }

    private createTruckMesh() {
        const truckMesh = new THREE.Mesh(
            new THREE.BoxGeometry(100, 25, 30),
            new THREE.MeshPhongMaterial({ color: TRUCK_BODY_COLOR })
        );
        truckMesh.castShadow = true;

        const backLeftWheel = this.wheel(WHEEL_COLOR, { r: 6, l: 4 });
        backLeftWheel.position.set(-33, -12, -15);
        truckMesh.add(backLeftWheel);

        const backRightWheel = this.wheel(WHEEL_COLOR, { r: 6, l: 4 });
        backRightWheel.position.set(-33, -12, 15);
        truckMesh.add(backRightWheel);

        const backFrontLeftWheel = this.wheel(WHEEL_COLOR, { r: 6, l: 4 });
        backFrontLeftWheel.position.set(-20, -12, -15);
        truckMesh.add(backFrontLeftWheel);

        const backFrontRightWheel = this.wheel(WHEEL_COLOR, { r: 6, l: 4 });
        backFrontRightWheel.position.set(-20, -12, 15);
        truckMesh.add(backFrontRightWheel);

        const backLefInnertWheel = this.wheel(WHEEL_COLOR, { r: 6, l: 4 });
        backLefInnertWheel.position.set(-33, -12, -10);
        truckMesh.add(backLefInnertWheel);

        const backRighInnertWheel = this.wheel(WHEEL_COLOR, { r: 6, l: 4 });
        backRighInnertWheel.position.set(-33, -12, 10);
        truckMesh.add(backRighInnertWheel);

        const backFrontLeftInnerWheel = this.wheel(WHEEL_COLOR, { r: 6, l: 4 });
        backFrontLeftInnerWheel.position.set(-20, -12, -10);
        truckMesh.add(backFrontLeftInnerWheel);

        const backFrontRightInnerWheel = this.wheel(WHEEL_COLOR, { r: 6, l: 4 });
        backFrontRightInnerWheel.position.set(-20, -12, 10);
        truckMesh.add(backFrontRightInnerWheel);

        const frontLeftWheel = this.wheel(WHEEL_COLOR, { r: 6, l: 4 });
        frontLeftWheel.position.set(30, -12, -15);
        truckMesh.add(frontLeftWheel);

        const frontRightWheel = this.wheel(WHEEL_COLOR, { r: 6, l: 4 });
        frontRightWheel.position.set(30, -12, 15);
        truckMesh.add(frontRightWheel);

        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(25, 20, 25),
            new THREE.MeshPhongMaterial({ color: TRUCK_CABIN_COLOR })
        );

        const cabinXPos = (truckMesh.position.x + truckMesh.geometry.parameters.width / 2 + cabin.geometry.parameters.width / 2 + 1);
        cabin.position.set(cabinXPos, truckMesh.position.y, truckMesh.position.z);
        cabin.castShadow = true;

        const rightHeadLightTarget = this.headLightTraget(100, cabin.position.y - 5, 2 - cabin.geometry.parameters.depth / 2);
        const leftHeadLightTarget = this.headLightTraget(100, cabin.position.y - 5, cabin.geometry.parameters.depth / 2 - 2);

        cabin.add(leftHeadLightTarget);
        cabin.add(rightHeadLightTarget);

        const rightHeadLightBox = this.headLightBox(cabin.geometry.parameters.width / 2, cabin.position.y - 5, 2 - cabin.geometry.parameters.depth / 2);
        const leftHeadLightBox = this.headLightBox(cabin.geometry.parameters.width / 2, cabin.position.y - 5, cabin.geometry.parameters.depth / 2 - 2);

        cabin.add(rightHeadLightBox);
        cabin.add(leftHeadLightBox);

        const leftHeadLight = this.headLight(leftHeadLightBox, leftHeadLightTarget);
        leftHeadLight.name = "leftHeadLight";

        const rightHeadLight = this.headLight(rightHeadLightBox, rightHeadLightTarget);
        rightHeadLight.name = "rightHeadLight";

        cabin.add(leftHeadLight);
        cabin.add(rightHeadLight);

        const cabinLeftWheel = this.wheel(WHEEL_COLOR, { r: 6, l: 4 });
        cabinLeftWheel.position.set(cabin.geometry.parameters.width / 10, -12, cabin.geometry.parameters.width / 2);
        cabinLeftWheel.name = "cabinLeftWheel";
        cabin.add(cabinLeftWheel);

        const cabinRightWheel = this.wheel(WHEEL_COLOR, { r: 6, l: 4 });
        cabinRightWheel.position.set(cabin.geometry.parameters.width / 10, -12, 0 - cabin.geometry.parameters.width / 2);
        cabinRightWheel.name = "cabinRightWheel";
        cabin.add(cabinRightWheel);
        truckMesh.add(cabin);
        truckMesh.scale.set(0.8, 0.8, 0.8);

        return truckMesh;
    }

    private wheel(color: number, { r, l }: WheelDimentions) {
        const geometry = new THREE.CylinderGeometry(r, r, l, 65);
        const material = new THREE.MeshPhongMaterial({ color });
        const wheel = new THREE.Mesh(geometry, material);
        wheel.castShadow = true;
        wheel.rotateX(Math.PI / 2);
        return wheel;
    }

    private headLightTraget(xPos: number, yPos: number, zPos: number) {
        const headLightTarget = new THREE.Mesh(
            new THREE.SphereGeometry(5),
            new THREE.MeshBasicMaterial()
        );

        headLightTarget.position.set(xPos, yPos, zPos);
        headLightTarget.visible = false;
        return headLightTarget;
    }

    private headLightBox(xPos: number, yPos: number, zPos: number) {
        const rightHeadLightBox = new THREE.Mesh(
            new THREE.BoxGeometry(1, 3, 3),
            new THREE.MeshPhongMaterial({ color: HEAD_LIGHT_COLOR })
        );

        rightHeadLightBox.position.set(xPos, yPos, zPos);
        return rightHeadLightBox;
    }

    private headLight(headLightBox: THREE.Mesh, headLightTarget: THREE.Mesh) {
        const headLight = new THREE.SpotLight(HEAD_LIGHT_COLOR, Math.PI, 0, Math.PI / 16, 1);
        headLight.position.copy(headLightBox.position);
        headLight.target = headLightTarget;
        headLight.visible = true;
        headLight.intensity = 1;
        return headLight;
    }

    public getTruckMesh() {
        return this.truckMesh;
    }

    public isMoveAble() {
        return this.moveable;
    }

    public setMoveAble(val: boolean) {
        this.moveable = val;
    }

    public lookAt(newPivotPos: THREE.Vector3) {
        this.pivotPos = newPivotPos;
        this.update();
    }

    private update() {
        this.truckMesh.lookAt(this.pivotPos);
        this.truckMesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI * -0.5);
        if (this.isMoveAble()) {
            this.truckMesh.position.lerp(new THREE.Vector3(this.pivotPos.x, this.truckMesh.position.y, this.pivotPos.z), 0.03);
        }
    }
}