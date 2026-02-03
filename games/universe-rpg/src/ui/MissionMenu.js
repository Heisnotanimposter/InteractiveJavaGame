import * as THREE from 'three';

export class MissionMenu {
    constructor() {
        this.visible = false;
        this.missionSystem = null;
        this.playerStats = null;
        
        this.createUI();
    }
    
    createUI() {
        this.modal = document.createElement('div');
        this.modal.id = 'mission-modal';
        this.modal.style.position = 'absolute';
        this.modal.style.top = '50%';
        this.modal.style.left = '50%';
        this.modal.style.transform = 'translate(-50%, -50%)';
        this.modal.style.backgroundColor = 'rgba(0, 20, 40, 0.95)';
        this.modal.style.border = '2px solid #00aaff';
        this.modal.style.padding = '20px';
        this.modal.style.color = '#fff';
        this.modal.style.minWidth = '600px';
        this.modal.style.maxHeight = '80vh';
        this.modal.style.overflowY = 'auto';
        this.modal.style.display = 'none';
        this.modal.style.zIndex = '100';
        this.modal.style.fontFamily = 'Courier New, monospace';
        document.body.appendChild(this.modal);
    }
    
    open(missionSystem, playerStats) {
        this.missionSystem = missionSystem;
        this.playerStats = playerStats;
        this.visible = true;
        this.modal.style.display = 'block';
        this.updateDisplay();
    }
    
    close() {
        this.visible = false;
        this.modal.style.display = 'none';
    }
    
    updateDisplay() {
        if (!this.missionSystem || !this.playerStats) return;
        
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #00aaff;">Mission Board</h2>
                <button id="mission-close" style="background:#ff3300; border:none; padding:8px 15px; color:white; cursor:pointer; font-size:14px;">Close</button>
            </div>
        `;
        
        // Active Missions
        if (this.missionSystem.activeMissions.length > 0) {
            html += `<h3 style="color: #00ff00; margin-top: 20px;">Active Missions</h3>`;
            this.missionSystem.activeMissions.forEach((mission, index) => {
                const progress = Math.floor((mission.progress / mission.maxProgress) * 100);
                html += `
                    <div style="margin-bottom: 15px; padding: 15px; background: rgba(0, 100, 0, 0.2); border: 1px solid #00aa00;">
                        <div style="font-weight: bold; color: #00ff00; margin-bottom: 5px;">${mission.title}</div>
                        <div style="font-size: 12px; margin-bottom: 5px;">${mission.description}</div>
                        <div style="font-size: 12px; color: #aaa;">Faction: ${mission.faction} | Progress: ${progress}%</div>
                        <div style="margin-top: 8px; background: rgba(0, 0, 0, 0.3); height: 8px; border-radius: 4px;">
                            <div style="background: #00ff00; height: 100%; width: ${progress}%; border-radius: 4px;"></div>
                        </div>
                    </div>
                `;
            });
        }
        
        // Available Missions
        if (this.missionSystem.availableMissions.length > 0) {
            html += `<h3 style="color: #00aaff; margin-top: 20px;">Available Missions</h3>`;
            this.missionSystem.availableMissions.forEach((mission, index) => {
                html += `
                    <div style="margin-bottom: 15px; padding: 15px; background: rgba(0, 50, 100, 0.2); border: 1px solid #004466;">
                        <div style="font-weight: bold; color: #00aaff; margin-bottom: 5px;">${mission.title}</div>
                        <div style="font-size: 12px; margin-bottom: 5px;">${mission.description}</div>
                        <div style="font-size: 12px; color: #aaa;">Faction: ${mission.faction}</div>
                        <div style="font-size: 12px; color: #00ff00; margin-top: 5px;">
                            Reward: ${mission.reward.credits}₵ + ${mission.reward.xp} XP
                        </div>
                        <button class="accept-mission" data-index="${index}" style="background:#00aa00; border:none; padding:8px 15px; color:white; cursor:pointer; margin-top: 10px;">
                            Accept Mission
                        </button>
                    </div>
                `;
            });
        } else {
            html += `<div style="color: #666; margin-top: 20px;">No missions available. Check back later.</div>`;
        }
        
        // Completed Missions
        if (this.missionSystem.completedMissions.length > 0) {
            html += `<h3 style="color: #888; margin-top: 20px;">Recently Completed</h3>`;
            this.missionSystem.completedMissions.slice(-5).forEach(mission => {
                html += `
                    <div style="margin-bottom: 10px; padding: 10px; background: rgba(50, 50, 50, 0.2); border: 1px solid #444;">
                        <div style="font-size: 12px; color: #888;">${mission.title} - Completed</div>
                    </div>
                `;
            });
        }
        
        this.modal.innerHTML = html;
        
        document.getElementById('mission-close').addEventListener('click', () => this.close());
        
        this.modal.querySelectorAll('.accept-mission').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const mission = this.missionSystem.availableMissions[index];
                if (mission) {
                    this.missionSystem.acceptMission(mission);
                    this.updateDisplay();
                }
            });
        });
    }
}

