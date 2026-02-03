import * as THREE from 'three';

export class NPCTrader {
    constructor(scene, position, faction = 'NEUTRAL') {
        this.scene = scene;
        this.position = position.clone();
        this.faction = faction;
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
        );
        
        // Ship mesh (different from player ship)
        const geometry = new THREE.BoxGeometry(2, 1, 3);
        const material = new THREE.MeshStandardMaterial({ 
            color: faction === 'FRIENDLY' ? 0x00aaff : faction === 'HOSTILE' ? 0xff3300 : 0x888888,
            roughness: 0.5
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
        
        // Trade goods (NPCs have different prices)
        this.tradeGoods = this.generateTradeGoods();
        this.credits = Math.floor(Math.random() * 500) + 200;
        this.interactionRange = 20;
    }
    
    generateTradeGoods() {
        // NPCs might have better or worse prices
        const priceModifier = 0.8 + Math.random() * 0.4; // 80% to 120% of base price
        
        return {
            metals: { 
                buy: Math.floor(10 * priceModifier), 
                sell: Math.floor(15 * priceModifier) 
            },
            crystals: { 
                buy: Math.floor(20 * priceModifier), 
                sell: Math.floor(30 * priceModifier) 
            },
            fuel: { 
                buy: Math.floor(5 * priceModifier), 
                sell: Math.floor(8 * priceModifier) 
            },
            scrap: { 
                buy: Math.floor(3 * priceModifier), 
                sell: Math.floor(5 * priceModifier) 
            }
        };
    }
    
    update() {
        // Drift slowly
        this.position.add(this.velocity);
        this.mesh.position.copy(this.position);
        
        // Slow rotation
        this.mesh.rotation.y += 0.01;
        
        // Boundary check (wrap around or reverse)
        if (Math.abs(this.position.x) > 10000 || 
            Math.abs(this.position.y) > 10000 || 
            Math.abs(this.position.z) > 10000) {
            this.velocity.multiplyScalar(-1);
        }
    }
    
    checkCollision(spaceshipPosition) {
        return this.position.distanceTo(spaceshipPosition) < this.interactionRange;
    }
    
    trade(playerStats, item, action) {
        // action: 'buy' or 'sell'
        const prices = this.tradeGoods[item];
        if (!prices) return { success: false, reason: 'Item not available' };
        
        if (action === 'buy') {
            if (!playerStats.canCarryMore(1)) {
                return { success: false, reason: 'Cargo full' };
            }
            if (this.credits < prices.buy) {
                return { success: false, reason: 'Trader has no credits' };
            }
            if (playerStats.spendCredits(prices.buy)) {
                playerStats.addResource(item, 1);
                this.credits -= prices.buy;
                return { success: true, action: 'bought', item, price: prices.buy };
            }
            return { success: false, reason: 'Not enough credits' };
        } else if (action === 'sell') {
            if (playerStats.removeResource(item, 1)) {
                playerStats.addCredits(prices.sell);
                this.credits += prices.sell;
                return { success: true, action: 'sold', item, price: prices.sell };
            }
            return { success: false, reason: 'No item to sell' };
        }
        
        return { success: false, reason: 'Invalid action' };
    }
}

