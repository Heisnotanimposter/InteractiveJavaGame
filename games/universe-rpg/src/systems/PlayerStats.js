export class PlayerStats {
    constructor() {
        this.level = 1;
        this.experience = 0;
        this.experienceToNext = 100;
        this.credits = 1000; // Starting credits
        this.reputation = {
            FRIENDLY: 50,
            NEUTRAL: 0,
            HOSTILE: -50
        };
        
        // Ship stats (upgradeable)
        this.shipStats = {
            maxEnergy: 100,
            energyRegen: 0.1,
            maxSpeed: 5,
            acceleration: 0.02,
            cargoCapacity: 50,
            shieldCapacity: 0,
            weaponDamage: 0,
            scanRange: 100
        };
        
        // Resources
        this.resources = {
            metals: 0,
            crystals: 0,
            fuel: 100,
            scrap: 0
        };
        
        // Discoveries
        this.discoveredSystems = new Set();
        this.discoveredWormholes = new Set();
        this.missionsCompleted = 0;
    }
    
    addExperience(amount) {
        this.experience += amount;
        while (this.experience >= this.experienceToNext) {
            this.experience -= this.experienceToNext;
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.experienceToNext = Math.floor(this.experienceToNext * 1.5);
        // Bonus stats on level up
        this.shipStats.maxEnergy += 10;
        this.shipStats.energyRegen += 0.01;
    }
    
    addCredits(amount) {
        this.credits += amount;
    }
    
    spendCredits(amount) {
        if (this.credits >= amount) {
            this.credits -= amount;
            return true;
        }
        return false;
    }
    
    modifyReputation(faction, amount) {
        if (this.reputation.hasOwnProperty(faction)) {
            this.reputation[faction] = Math.max(-100, Math.min(100, this.reputation[faction] + amount));
        }
    }
    
    getReputationStatus(faction) {
        const rep = this.reputation[faction] || 0;
        if (rep >= 75) return 'ALLIED';
        if (rep >= 25) return 'FRIENDLY';
        if (rep >= -25) return 'NEUTRAL';
        if (rep >= -75) return 'UNFRIENDLY';
        return 'HOSTILE';
    }
    
    addResource(type, amount) {
        if (this.resources.hasOwnProperty(type)) {
            this.resources[type] += amount;
        }
    }
    
    removeResource(type, amount) {
        if (this.resources.hasOwnProperty(type) && this.resources[type] >= amount) {
            this.resources[type] -= amount;
            return true;
        }
        return false;
    }
    
    getTotalCargo() {
        return Object.values(this.resources).reduce((sum, val) => sum + val, 0);
    }
    
    canCarryMore(amount = 1) {
        return this.getTotalCargo() + amount <= this.shipStats.cargoCapacity;
    }
}

