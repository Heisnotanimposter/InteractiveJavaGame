export class UpgradeMenu {
    constructor() {
        this.visible = false;
        this.playerStats = null;
        
        this.createUI();
    }
    
    createUI() {
        this.modal = document.createElement('div');
        this.modal.id = 'upgrade-modal';
        this.modal.style.position = 'absolute';
        this.modal.style.top = '50%';
        this.modal.style.left = '50%';
        this.modal.style.transform = 'translate(-50%, -50%)';
        this.modal.style.backgroundColor = 'rgba(0, 20, 40, 0.95)';
        this.modal.style.border = '2px solid #00aaff';
        this.modal.style.padding = '20px';
        this.modal.style.color = '#fff';
        this.modal.style.minWidth = '500px';
        this.modal.style.maxHeight = '80vh';
        this.modal.style.overflowY = 'auto';
        this.modal.style.display = 'none';
        this.modal.style.zIndex = '100';
        this.modal.style.fontFamily = 'Courier New, monospace';
        document.body.appendChild(this.modal);
    }
    
    open(playerStats) {
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
        if (!this.playerStats) return;
        
        const stats = this.playerStats.shipStats;
        const upgrades = [
            {
                id: 'maxEnergy',
                name: 'Energy Capacity',
                current: stats.maxEnergy,
                cost: Math.floor(100 * Math.pow(1.5, Math.floor(stats.maxEnergy / 10))),
                upgrade: () => {
                    if (this.playerStats.spendCredits(this.getUpgradeCost('maxEnergy'))) {
                        stats.maxEnergy += 10;
                        this.updateDisplay();
                    }
                }
            },
            {
                id: 'energyRegen',
                name: 'Energy Regeneration',
                current: stats.energyRegen.toFixed(2),
                cost: Math.floor(150 * Math.pow(1.5, Math.floor(stats.energyRegen * 10))),
                upgrade: () => {
                    if (this.playerStats.spendCredits(this.getUpgradeCost('energyRegen'))) {
                        stats.energyRegen += 0.05;
                        this.updateDisplay();
                    }
                }
            },
            {
                id: 'maxSpeed',
                name: 'Max Speed',
                current: stats.maxSpeed.toFixed(2),
                cost: Math.floor(200 * Math.pow(1.5, Math.floor(stats.maxSpeed))),
                upgrade: () => {
                    if (this.playerStats.spendCredits(this.getUpgradeCost('maxSpeed'))) {
                        stats.maxSpeed += 0.5;
                        this.updateDisplay();
                    }
                }
            },
            {
                id: 'cargoCapacity',
                name: 'Cargo Capacity',
                current: stats.cargoCapacity,
                cost: Math.floor(250 * Math.pow(1.3, Math.floor(stats.cargoCapacity / 10))),
                upgrade: () => {
                    if (this.playerStats.spendCredits(this.getUpgradeCost('cargoCapacity'))) {
                        stats.cargoCapacity += 10;
                        this.updateDisplay();
                    }
                }
            },
            {
                id: 'shieldCapacity',
                name: 'Shield Capacity',
                current: stats.shieldCapacity,
                cost: Math.floor(300 * Math.pow(1.4, Math.floor(stats.shieldCapacity / 20))),
                upgrade: () => {
                    if (this.playerStats.spendCredits(this.getUpgradeCost('shieldCapacity'))) {
                        stats.shieldCapacity += 20;
                        this.updateDisplay();
                    }
                }
            },
            {
                id: 'weaponDamage',
                name: 'Weapon Damage',
                current: stats.weaponDamage,
                cost: Math.floor(400 * Math.pow(1.5, Math.floor(stats.weaponDamage / 10))),
                upgrade: () => {
                    if (this.playerStats.spendCredits(this.getUpgradeCost('weaponDamage'))) {
                        stats.weaponDamage += 10;
                        this.updateDisplay();
                    }
                }
            }
        ];
        
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #00aaff;">Ship Upgrades</h2>
                <button id="upgrade-close" style="background:#ff3300; border:none; padding:8px 15px; color:white; cursor:pointer; font-size:14px;">Close</button>
            </div>
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(0, 50, 100, 0.3); border: 1px solid #00aaff;">
                <div>Credits: <span style="color: #00ff00;">${Math.floor(this.playerStats.credits)}</span></div>
                <div>Level: ${this.playerStats.level} | XP: ${this.playerStats.experience} / ${this.playerStats.experienceToNext}</div>
            </div>
        `;
        
        upgrades.forEach(upgrade => {
            html += `
                <div style="margin-bottom: 15px; padding: 15px; background: rgba(0, 50, 100, 0.2); border: 1px solid #004466;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                            <strong style="color: #00aaff;">${upgrade.name}</strong>
                            <div style="font-size: 12px; color: #aaa;">Current: ${upgrade.current}</div>
                        </div>
                        <button class="upgrade-btn" data-id="${upgrade.id}" style="background:#00aa00; border:none; padding:8px 15px; color:white; cursor:pointer;">
                            Upgrade (${upgrade.cost}₵)
                        </button>
                    </div>
                </div>
            `;
        });
        
        this.modal.innerHTML = html;
        
        document.getElementById('upgrade-close').addEventListener('click', () => this.close());
        
        this.modal.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const upgrade = upgrades.find(u => u.id === id);
                if (upgrade) {
                    upgrade.upgrade();
                }
            });
        });
    }
    
    getUpgradeCost(statId) {
        const stats = this.playerStats.shipStats;
        switch(statId) {
            case 'maxEnergy': return Math.floor(100 * Math.pow(1.5, Math.floor(stats.maxEnergy / 10)));
            case 'energyRegen': return Math.floor(150 * Math.pow(1.5, Math.floor(stats.energyRegen * 10)));
            case 'maxSpeed': return Math.floor(200 * Math.pow(1.5, Math.floor(stats.maxSpeed)));
            case 'cargoCapacity': return Math.floor(250 * Math.pow(1.3, Math.floor(stats.cargoCapacity / 10)));
            case 'shieldCapacity': return Math.floor(300 * Math.pow(1.4, Math.floor(stats.shieldCapacity / 20)));
            case 'weaponDamage': return Math.floor(400 * Math.pow(1.5, Math.floor(stats.weaponDamage / 10)));
            default: return 0;
        }
    }
}

