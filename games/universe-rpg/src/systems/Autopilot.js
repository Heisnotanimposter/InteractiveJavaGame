import * as THREE from 'three';

export class Autopilot {
    constructor(spaceship) {
        this.spaceship = spaceship;
        this.active = false;
        this.target = null;
        this.arrivalDistance = 10; // Distance to consider "arrived"
        this.maxSpeed = 5;
    }
    
    setTarget(position) {
        this.target = position.clone();
        this.active = true;
    }
    
    cancel() {
        this.active = false;
        this.target = null;
    }
    
    update() {
        if (!this.active || !this.target) return;
        
        const distance = this.spaceship.position.distanceTo(this.target);
        
        // Check if arrived
        if (distance < this.arrivalDistance) {
            this.active = false;
            this.target = null;
            return { arrived: true };
        }
        
        // Calculate direction to target
        const direction = new THREE.Vector3()
            .subVectors(this.target, this.spaceship.position)
            .normalize();
        
        // Calculate desired rotation
        const forward = new THREE.Vector3(
            Math.sin(this.spaceship.rotation),
            0,
            Math.cos(this.spaceship.rotation)
        );
        
        // Calculate yaw (rotation around Y axis)
        const yawAngle = Math.atan2(direction.x, direction.z);
        let yawDiff = yawAngle - this.spaceship.rotation;
        
        // Normalize angle difference
        while (yawDiff > Math.PI) yawDiff -= 2 * Math.PI;
        while (yawDiff < -Math.PI) yawDiff += 2 * Math.PI;
        
        // Calculate pitch (rotation around X axis)
        const pitchAngle = Math.asin(direction.y);
        let pitchDiff = pitchAngle - this.spaceship.pitch;
        
        // Apply rotation
        const turnSpeed = 0.05;
        if (Math.abs(yawDiff) > 0.1) {
            this.spaceship.rotation += Math.sign(yawDiff) * Math.min(Math.abs(yawDiff), turnSpeed);
        }
        if (Math.abs(pitchDiff) > 0.1) {
            this.spaceship.pitch += Math.sign(pitchDiff) * Math.min(Math.abs(pitchDiff), turnSpeed);
        }
        
        // Apply forward thrust
        const accel = this.spaceship.playerStats ? 
            (this.spaceship.playerStats.shipStats.acceleration || 0.02) : 0.02;
        
        const forward3D = new THREE.Vector3(
            Math.sin(this.spaceship.rotation) * Math.cos(this.spaceship.pitch),
            Math.sin(this.spaceship.pitch),
            Math.cos(this.spaceship.rotation) * Math.cos(this.spaceship.pitch)
        ).normalize();
        
        // Thrust towards target
        if (this.spaceship.energy > 0) {
            this.spaceship.velocity.add(forward3D.multiplyScalar(accel * 0.8));
            this.spaceship.energy -= this.spaceship.thrustCost * 0.5;
        }
        
        // Limit speed
        if (this.spaceship.velocity.length() > this.maxSpeed) {
            this.spaceship.velocity.normalize().multiplyScalar(this.maxSpeed);
        }
        
        return { 
            active: true, 
            distance: distance,
            direction: direction 
        };
    }
    
    getStatus() {
        if (!this.active || !this.target) return null;
        
        const distance = this.spaceship.position.distanceTo(this.target);
        return {
            active: true,
            distance: distance,
            target: this.target
        };
    }
}

