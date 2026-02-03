import * as THREE from 'three';

export class ResourceNode {
    constructor(scene, position, resourceType = 'metals') {
        this.scene = scene;
        this.position = position.clone();
        this.resourceType = resourceType;
        this.amount = Math.floor(Math.random() * 10) + 5;
        this.collected = false;
        
        // Visual representation
        const geometry = new THREE.OctahedronGeometry(1, 0);
        const colors = {
            metals: 0x888888,
            crystals: 0x00ffff,
            fuel: 0xffff00,
            scrap: 0xff8800
        };
        const material = new THREE.MeshStandardMaterial({ 
            color: colors[resourceType] || 0xffffff,
            emissive: colors[resourceType] || 0xffffff,
            emissiveIntensity: 0.5
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
        
        // Glow effect
        const glowGeometry = new THREE.OctahedronGeometry(1.2, 0);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: colors[resourceType] || 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glowMesh);
        
        // Rotation animation
        this.rotationSpeed = 0.02;
    }
    
    update() {
        if (this.collected) return;
        
        this.mesh.rotation.y += this.rotationSpeed;
        this.mesh.rotation.x += this.rotationSpeed * 0.5;
        
        // Pulsing glow
        const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.2;
        this.glowMesh.scale.setScalar(pulse);
    }
    
    collect(playerStats) {
        if (this.collected) return false;
        
        if (playerStats.canCarryMore(this.amount)) {
            playerStats.addResource(this.resourceType, this.amount);
            this.collected = true;
            this.scene.remove(this.mesh);
            return { success: true, amount: this.amount, type: this.resourceType };
        }
        return { success: false, reason: 'Cargo full' };
    }
    
    checkCollision(spaceshipPosition) {
        if (this.collected) return false;
        return this.position.distanceTo(spaceshipPosition) < 3;
    }
}

