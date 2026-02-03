import * as THREE from 'three';

export class Spaceship {
    constructor(scene, playerStats) {
        this.scene = scene;
        this.playerStats = playerStats;

        // Mesh
        const geometry = new THREE.ConeGeometry(1, 3, 8);
        geometry.rotateX(Math.PI / 2); // Point forward
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.5 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0, 0);
        this.scene.add(this.mesh);

        // Thruster Visual
        const thrusterGeometry = new THREE.ConeGeometry(0.5, 1, 8);
        thrusterGeometry.rotateX(-Math.PI / 2); // Point backward
        const thrusterMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        this.thrusterMesh = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
        this.thrusterMesh.position.set(0, 0, 1.5); // Behind the ship
        this.thrusterMesh.visible = false;
        this.mesh.add(this.thrusterMesh); // Attach to ship

        // Thruster Light
        this.thrusterLight = new THREE.PointLight(0x00ffff, 0, 10);
        this.thrusterLight.position.set(0, 0, 2);
        this.mesh.add(this.thrusterLight);

        // Physics
        this.position = this.mesh.position;
        this.velocity = new THREE.Vector3();
        this.rotation = 0; // Yaw (rotation around Y axis)
        this.pitch = 0; // Pitch (rotation around X axis)
        this.roll = 0; // Roll (rotation around Z axis)
        this.acceleration = 0.02; // Lower acceleration for space feel
        this.turnSpeed = 0.04;

        // Stats (synced with playerStats)
        this.rechargeRate = 0.0; // Dynamic based on star proximity
        this.thrustCost = 0.1;
        
        // Initialize energy from playerStats
        this.energy = playerStats.shipStats.maxEnergy;
    }
    
    get maxEnergy() {
        return this.playerStats ? this.playerStats.shipStats.maxEnergy : 100;
    }

    update(input, nearbySystems) {
        // Yaw rotation (Y-axis, horizontal turning)
        if (input.isDown('ArrowLeft') || input.isDown('KeyA')) {
            this.rotation += this.turnSpeed;
        }
        if (input.isDown('ArrowRight') || input.isDown('KeyD')) {
            this.rotation -= this.turnSpeed;
        }
        
        // Pitch rotation (X-axis, up/down tilting)
        if (input.isDown('KeyQ')) {
            this.pitch += this.turnSpeed;
        }
        if (input.isDown('KeyE')) {
            this.pitch -= this.turnSpeed;
        }
        
        // Roll rotation (Z-axis, banking)
        if (input.isDown('KeyZ')) {
            this.roll += this.turnSpeed;
        }
        if (input.isDown('KeyC')) {
            this.roll -= this.turnSpeed;
        }
        
        // Clamp pitch to prevent over-rotation
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        
        // Apply rotations to mesh
        this.mesh.rotation.y = this.rotation;
        this.mesh.rotation.x = this.pitch;
        this.mesh.rotation.z = this.roll;

        // Limit velocity based on max speed
        const maxSpeed = this.playerStats ? this.playerStats.shipStats.maxSpeed : 5;
        if (this.velocity.length() > maxSpeed) {
            this.velocity.normalize().multiplyScalar(maxSpeed);
        }
        
        // Thrust (Newtonian: Add to velocity in 3D space)
        let isThrusting = false;
        const accel = this.playerStats ? (this.playerStats.shipStats.acceleration || this.acceleration) : this.acceleration;
        
        // Calculate forward direction in 3D space based on yaw and pitch
        const forward = new THREE.Vector3(
            Math.sin(this.rotation) * Math.cos(this.pitch),
            Math.sin(this.pitch),
            Math.cos(this.rotation) * Math.cos(this.pitch)
        ).normalize();
        
        if ((input.isDown('ArrowUp') || input.isDown('KeyW')) && this.energy > 0) {
            this.velocity.add(forward.multiplyScalar(accel));
            this.energy -= this.thrustCost;
            isThrusting = true;
        } else if ((input.isDown('ArrowDown') || input.isDown('KeyS')) && this.energy > 0) {
            // Reverse thrusters
            this.velocity.sub(forward.multiplyScalar(accel * 0.5));
            this.energy -= this.thrustCost;
            isThrusting = true;
        }
        
        // Vertical thrusters (independent of ship orientation)
        if (input.isDown('KeyR') && this.energy > 0) {
            // Move up in world space
            this.velocity.y += accel;
            this.energy -= this.thrustCost * 0.5;
            isThrusting = true;
        }
        if (input.isDown('ShiftLeft') || input.isDown('ShiftRight')) {
            // Move down in world space (using Shift)
            if (this.energy > 0) {
                this.velocity.y -= accel;
                this.energy -= this.thrustCost * 0.5;
                isThrusting = true;
            }
        }

        this.thrusterMesh.visible = isThrusting;
        if (isThrusting) {
            // Flicker effect
            const flicker = 0.8 + Math.random() * 0.4;
            this.thrusterMesh.scale.setScalar(flicker);
            this.thrusterLight.intensity = flicker * 2;
        } else {
            this.thrusterLight.intensity = 0;
        }

        // Brake (Stabilizers) - Costs energy
        if (input.isDown('Space') && this.energy > 0) {
            this.velocity.multiplyScalar(0.95);
            this.energy -= this.thrustCost * 0.5;
        }

        // Solar recharge from nearby stars
        this.rechargeRate = 0;
        if (nearbySystems && nearbySystems.length > 0) {
            nearbySystems.forEach(system => {
                const dist = this.position.distanceTo(system.position);
                if (dist < 100) { // Within recharge range
                    const rechargeAmount = (100 - dist) / 100 * 0.5; // Max 0.5 per system
                    this.rechargeRate += rechargeAmount;
                }
            });
        }
        
        // Add base regen from ship stats
        if (this.playerStats) {
            this.rechargeRate += this.playerStats.shipStats.energyRegen;
        }

        // Apply Recharge
        this.energy = Math.min(this.energy + this.rechargeRate, this.maxEnergy);
        this.energy = Math.max(this.energy, 0);

        // Apply Velocity
        this.position.add(this.velocity);
    }
}
