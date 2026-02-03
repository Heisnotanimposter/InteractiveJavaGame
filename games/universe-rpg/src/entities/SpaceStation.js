import * as THREE from 'three';

export class SpaceStation {
    constructor(scene, position, faction) {
        this.scene = scene;
        this.position = position.clone();
        this.faction = faction;
        
        // Station Mesh
        const group = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.CylinderGeometry(3, 3, 2, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: faction === 'FRIENDLY' ? 0x00aaff : faction === 'HOSTILE' ? 0xff3300 : 0x888888,
            emissive: faction === 'FRIENDLY' ? 0x002244 : faction === 'HOSTILE' ? 0x440000 : 0x222222
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        group.add(body);
        
        // Ring
        const ringGeometry = new THREE.TorusGeometry(5, 0.3, 8, 32);
        const ringMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            emissive: 0x111111
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        group.add(ring);
        
        // Lights
        const light1 = new THREE.PointLight(
            faction === 'FRIENDLY' ? 0x00aaff : faction === 'HOSTILE' ? 0xff3300 : 0xffffff,
            1,
            20
        );
        light1.position.set(0, 0, 5);
        group.add(light1);
        
        const light2 = new THREE.PointLight(
            faction === 'FRIENDLY' ? 0x00aaff : faction === 'HOSTILE' ? 0xff3300 : 0xffffff,
            1,
            20
        );
        light2.position.set(0, 0, -5);
        group.add(light2);
        
        this.mesh = group;
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
        
        // Station data
        this.tradeGoods = this.generateTradeGoods();
        this.hasMissions = true;
        this.interactionRange = 15;
    }
    
    generateTradeGoods() {
        return {
            metals: { buy: 10, sell: 15 },
            crystals: { buy: 20, sell: 30 },
            fuel: { buy: 5, sell: 8 },
            scrap: { buy: 3, sell: 5 }
        };
    }
    
    update() {
        // Rotate slowly
        this.mesh.rotation.y += 0.005;
    }
    
    checkCollision(spaceshipPosition) {
        return this.position.distanceTo(spaceshipPosition) < this.interactionRange;
    }
    
    getInteractionOptions() {
        return {
            trade: true,
            missions: this.hasMissions,
            upgrade: this.faction === 'FRIENDLY',
            repair: true
        };
    }
}

