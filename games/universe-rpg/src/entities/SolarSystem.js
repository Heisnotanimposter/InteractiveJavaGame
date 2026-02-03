import * as THREE from 'three';
import { Planet } from './Planet.js';

export class SolarSystem {
    constructor(scene, position, faction) {
        this.scene = scene;
        this.position = position;
        this.faction = faction;
        this.planets = [];

        // Star
        const starSize = 1.5;
        const starGeometry = new THREE.SphereGeometry(starSize, 16, 16);
        let starColor = 0xffff00;
        if (faction === 'FRIENDLY') starColor = 0x00aaff;
        if (faction === 'HOSTILE') starColor = 0xff3300;

        const starMaterial = new THREE.MeshBasicMaterial({ color: starColor });
        this.starMesh = new THREE.Mesh(starGeometry, starMaterial);
        this.starMesh.position.copy(this.position);
        this.scene.add(this.starMesh);

        // Generate Planets
        const numPlanets = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < numPlanets; i++) {
            const radius = 5 + (i * 3);
            const size = 0.5 + Math.random() * 0.5;
            const color = Math.random() * 0xffffff;
            const speed = 0.01 + Math.random() * 0.02;

            const planet = new Planet(scene, position, radius, size, color, speed);
            this.planets.push(planet);
        }
    }

    update(playerPosition) {
        // Only update if system is near player
        if (playerPosition) {
            const distance = playerPosition.distanceTo(this.position);
            if (distance > 500) return; // Don't update distant systems
        }
        this.planets.forEach(p => p.update());
    }
}
