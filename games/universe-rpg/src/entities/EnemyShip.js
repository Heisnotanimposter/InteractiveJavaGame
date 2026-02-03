import * as THREE from 'three';

export class EnemyShip {
    constructor(scene, position, faction = 'HOSTILE') {
        this.scene = scene;
        this.position = position.clone();
        this.faction = faction;
        this.health = 50;
        this.maxHealth = 50;
        this.damage = 10;
        this.speed = 0.5;
        this.attackCooldown = 0;
        this.attackInterval = 60; // frames
        
        // Mesh
        const geometry = new THREE.ConeGeometry(1, 3, 8);
        geometry.rotateX(Math.PI / 2);
        const material = new THREE.MeshStandardMaterial({ 
            color: faction === 'HOSTILE' ? 0xff0000 : 0xffaa00,
            roughness: 0.5 
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
        
        // Health bar
        this.createHealthBar();
    }
    
    createHealthBar() {
        const barGeometry = new THREE.PlaneGeometry(2, 0.2);
        const barMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.healthBar = new THREE.Mesh(barGeometry, barMaterial);
        this.healthBar.position.set(0, 2, 0);
        this.mesh.add(this.healthBar);
    }
    
    update(playerPosition) {
        // Move towards player
        const direction = new THREE.Vector3()
            .subVectors(playerPosition, this.position)
            .normalize();
        
        this.position.add(direction.multiplyScalar(this.speed));
        this.mesh.position.copy(this.position);
        this.mesh.lookAt(playerPosition);
        
        // Update health bar
        const healthPercent = this.health / this.maxHealth;
        this.healthBar.scale.x = healthPercent;
        this.healthBar.material.color.setHex(healthPercent > 0.5 ? 0xff0000 : 0x00ff00);
        
        // Attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
    }
    
    attack(playerPosition) {
        if (this.attackCooldown <= 0) {
            const distance = this.position.distanceTo(playerPosition);
            if (distance < 30) {
                this.attackCooldown = this.attackInterval;
                return this.damage;
            }
        }
        return 0;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
            return true; // Destroyed
        }
        return false;
    }
    
    destroy() {
        this.scene.remove(this.mesh);
    }
    
    checkCollision(position, radius = 2) {
        return this.position.distanceTo(position) < radius;
    }
}

