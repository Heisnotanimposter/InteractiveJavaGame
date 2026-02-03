import * as THREE from 'three';

export class Wormhole {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position.clone();

        // Visuals
        const geometry = new THREE.TorusGeometry(3, 0.5, 16, 100);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        // Animation
        this.rotationSpeed = 0.02;
    }

    update() {
        this.mesh.rotation.z += this.rotationSpeed;
        this.mesh.rotation.x += this.rotationSpeed * 0.5;
    }

    checkCollision(spaceshipPosition) {
        return this.position.distanceTo(spaceshipPosition) < 4; // Simple distance check
    }
}
