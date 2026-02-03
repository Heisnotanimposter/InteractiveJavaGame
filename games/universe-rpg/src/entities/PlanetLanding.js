import * as THREE from 'three';

export class PlanetLanding {
    constructor(planet, scene) {
        this.planet = planet;
        this.scene = scene;
        this.canLand = false;
        this.landingRange = 5;
    }
    
    checkLanding(spaceshipPosition) {
        const distance = spaceshipPosition.distanceTo(this.planet.mesh.position);
        return distance < this.landingRange;
    }
    
    land(playerStats) {
        // Generate resources based on planet type
        const resources = {
            metals: Math.floor(Math.random() * 5) + 2,
            crystals: Math.floor(Math.random() * 3) + 1,
            scrap: Math.floor(Math.random() * 4) + 1
        };
        
        let collected = {};
        let totalCollected = 0;
        
        for (const [type, amount] of Object.entries(resources)) {
            if (playerStats.canCarryMore(amount)) {
                playerStats.addResource(type, amount);
                collected[type] = amount;
                totalCollected += amount;
            } else {
                const canCarry = playerStats.shipStats.cargoCapacity - playerStats.getTotalCargo();
                if (canCarry > 0) {
                    const actualAmount = Math.min(amount, canCarry);
                    playerStats.addResource(type, actualAmount);
                    collected[type] = actualAmount;
                    totalCollected += actualAmount;
                }
            }
        }
        
        playerStats.addExperience(30);
        
        return {
            success: totalCollected > 0,
            collected: collected,
            message: totalCollected > 0 
                ? `Collected resources: ${Object.entries(collected).map(([k, v]) => `${v} ${k}`).join(', ')}`
                : 'Cargo full! Cannot collect more resources.'
        };
    }
}

