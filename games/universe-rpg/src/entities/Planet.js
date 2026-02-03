import * as THREE from 'three';

export class Planet {
    constructor(scene, systemPosition, orbitRadius, size, color, speed) {
        this.scene = scene;
        this.systemPosition = systemPosition;
        this.orbitRadius = orbitRadius;
        this.speed = speed;
        this.angle = Math.random() * Math.PI * 2;

        // Mesh
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const material = new THREE.MeshStandardMaterial({ color: color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    update(time) {
        this.angle += this.speed;
        this.mesh.position.x = this.systemPosition.x + Math.cos(this.angle) * this.orbitRadius;
        this.mesh.position.z = this.systemPosition.z + Math.sin(this.angle) * this.orbitRadius;
        this.mesh.position.y = this.systemPosition.y;
    }
}
