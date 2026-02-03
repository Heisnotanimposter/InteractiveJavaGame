import * as THREE from 'three';

export class Anomaly {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position.clone();

        // Visuals: Yellow Octahedron
        const geometry = new THREE.OctahedronGeometry(2, 0);
        const material = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xaa5500, wireframe: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        // Animation
        this.rotationSpeed = 0.03;
    }

    update() {
        this.mesh.rotation.y += this.rotationSpeed;
        this.mesh.rotation.z += this.rotationSpeed * 0.5;
    }

    checkCollision(spaceshipPosition) {
        return this.position.distanceTo(spaceshipPosition) < 3;
    }
}
