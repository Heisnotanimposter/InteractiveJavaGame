import * as THREE from 'three';

export class MissionSystem {
    constructor(playerStats) {
        this.playerStats = playerStats;
        this.activeMissions = [];
        this.completedMissions = [];
        this.availableMissions = [];
    }
    
    generateMission(faction, location) {
        const missionTypes = [
            {
                type: 'DELIVERY',
                title: 'Cargo Delivery',
                description: `Deliver ${Math.floor(Math.random() * 10) + 5} units of cargo to a nearby system.`,
                reward: { credits: 200 + Math.random() * 300, xp: 50 },
                targetLocation: location.clone().add(new THREE.Vector3(
                    (Math.random() - 0.5) * 2000,
                    (Math.random() - 0.5) * 2000,
                    (Math.random() - 0.5) * 2000
                )),
                faction: faction,
                progress: 0,
                maxProgress: 1
            },
            {
                type: 'EXPLORE',
                title: 'Exploration Contract',
                description: 'Explore an uncharted system and report back.',
                reward: { credits: 150 + Math.random() * 200, xp: 75 },
                targetLocation: location.clone().add(new THREE.Vector3(
                    (Math.random() - 0.5) * 3000,
                    (Math.random() - 0.5) * 3000,
                    (Math.random() - 0.5) * 3000
                )),
                faction: faction,
                progress: 0,
                maxProgress: 1
            },
            {
                type: 'COLLECT',
                title: 'Resource Gathering',
                description: `Collect ${Math.floor(Math.random() * 5) + 3} units of rare materials.`,
                reward: { credits: 100 + Math.random() * 150, xp: 40 },
                targetLocation: null,
                faction: faction,
                progress: 0,
                maxProgress: Math.floor(Math.random() * 5) + 3,
                resourceType: ['metals', 'crystals', 'scrap'][Math.floor(Math.random() * 3)]
            },
            {
                type: 'COMBAT',
                title: 'Pirate Elimination',
                description: 'Eliminate hostile forces in a nearby sector.',
                reward: { credits: 300 + Math.random() * 400, xp: 100 },
                targetLocation: location.clone().add(new THREE.Vector3(
                    (Math.random() - 0.5) * 2500,
                    (Math.random() - 0.5) * 2500,
                    (Math.random() - 0.5) * 2500
                )),
                faction: faction,
                progress: 0,
                maxProgress: Math.floor(Math.random() * 3) + 2
            }
        ];
        
        return missionTypes[Math.floor(Math.random() * missionTypes.length)];
    }
    
    acceptMission(mission) {
        const index = this.availableMissions.indexOf(mission);
        if (index !== -1) {
            this.availableMissions.splice(index, 1);
            this.activeMissions.push(mission);
            return true;
        }
        return false;
    }
    
    updateMissionProgress(mission, amount = 1) {
        mission.progress += amount;
        if (mission.progress >= mission.maxProgress) {
            this.completeMission(mission);
        }
    }
    
    completeMission(mission) {
        const index = this.activeMissions.indexOf(mission);
        if (index !== -1) {
            this.activeMissions.splice(index, 1);
            this.completedMissions.push(mission);
            
            // Give rewards
            if (mission.reward.credits) {
                this.playerStats.addCredits(mission.reward.credits);
            }
            if (mission.reward.xp) {
                this.playerStats.addExperience(mission.reward.xp);
            }
            if (mission.faction) {
                this.playerStats.modifyReputation(mission.faction, 5);
            }
            
            this.playerStats.missionsCompleted++;
            return mission;
        }
        return null;
    }
    
    checkMissionProximity(playerPosition) {
        this.activeMissions.forEach(mission => {
            if (mission.targetLocation) {
                const distance = playerPosition.distanceTo(mission.targetLocation);
                if (distance < 50) {
                    if (mission.type === 'DELIVERY' || mission.type === 'EXPLORE') {
                        this.updateMissionProgress(mission, 1);
                    }
                }
            }
        });
    }
}

