import * as THREE from 'three';

export class WorldMap {
    constructor(universe, spaceship, autopilot) {
        this.universe = universe;
        this.spaceship = spaceship;
        this.autopilot = autopilot;
        this.visible = false;
        this.scale = 0.5; // Map pixels per world unit
        this.pointsOfInterest = [];
        this.selectedTarget = null;

        // Create Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'world-map';
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '50%';
        this.canvas.style.left = '50%';
        this.canvas.style.transform = 'translate(-50%, -50%)';
        this.canvas.style.border = '2px solid #00ffff';
        this.canvas.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.canvas.style.display = 'none';
        this.canvas.style.zIndex = '10';
        this.canvas.style.cursor = 'crosshair';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        
        // Click handler
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.autopilot) {
                this.autopilot.cancel();
                this.selectedTarget = null;
            }
        });
        
        // Instructions
        this.createInstructions();
    }
    
    createInstructions() {
        const instructions = document.createElement('div');
        instructions.id = 'map-instructions';
        instructions.style.position = 'absolute';
        instructions.style.top = '10px';
        instructions.style.left = '10px';
        instructions.style.color = '#00ffff';
        instructions.style.fontSize = '12px';
        instructions.style.fontFamily = 'Courier New, monospace';
        instructions.style.pointerEvents = 'none';
        instructions.style.zIndex = '11';
        instructions.innerHTML = 'Click on map to set autopilot target | Right-click to cancel';
        document.body.appendChild(instructions);
    }

    toggle() {
        this.visible = !this.visible;
        this.canvas.style.display = this.visible ? 'block' : 'none';
        const instructions = document.getElementById('map-instructions');
        if (instructions) {
            instructions.style.display = this.visible ? 'block' : 'none';
        }
        if (this.visible) {
            this.updatePointsOfInterest();
            this.lastDrawTime = 0; // Force redraw
            this.factionCache = new Map(); // Clear cache when opening
            this.draw();
        } else {
            // Clear cache when closing to save memory
            this.factionCache = null;
        }
    }
    
    updatePointsOfInterest() {
        this.pointsOfInterest = this.universe.getAllPointsOfInterest();
    }
    
    handleClick(e) {
        if (!this.visible) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicking on a POI
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const playerX = this.spaceship.position.x;
        const playerZ = this.spaceship.position.z;
        const playerY = this.spaceship.position.y;
        
        const worldX = playerX + (x - centerX) / this.scale;
        const worldZ = playerZ + (y - centerY) / this.scale;
        
        // Check for nearby POI clicks (within 20 pixels)
        let clickedPOI = null;
        let minDist = 20;
        
        // Check all POI types
        const allPOIs = [
            ...this.pointsOfInterest.stations.map(p => ({ ...p, icon: '🛸' })),
            ...this.pointsOfInterest.systems.map(p => ({ ...p, icon: '⭐' })),
            ...this.pointsOfInterest.wormholes.map(p => ({ ...p, icon: '🌀' })),
            ...this.pointsOfInterest.resourceNodes.map(p => ({ ...p, icon: '💎' })),
            ...this.pointsOfInterest.npcTraders.map(p => ({ ...p, icon: '🚢' }))
        ];
        
        for (const poi of allPOIs) {
            const poiX = centerX + (poi.x - playerX) * this.scale;
            const poiZ = centerY + (poi.z - playerZ) * this.scale;
            const dist = Math.sqrt((x - poiX) ** 2 + (y - poiZ) ** 2);
            
            if (dist < minDist) {
                minDist = dist;
                clickedPOI = poi;
            }
        }
        
        if (clickedPOI) {
            // Clicked on a POI - use its exact position
            this.setAutopilotTarget(new THREE.Vector3(clickedPOI.x, clickedPOI.y || playerY, clickedPOI.z));
            this.selectedTarget = clickedPOI;
        } else {
            // Clicked on empty space - use clicked position
            this.setAutopilotTarget(new THREE.Vector3(worldX, playerY, worldZ));
            this.selectedTarget = null;
        }
    }
    
    setAutopilotTarget(position) {
        if (this.autopilot) {
            this.autopilot.setTarget(position);
        }
    }

    draw() {
        if (!this.visible) return;
        
        // Throttle map updates - don't redraw every frame
        const now = performance.now();
        if (!this.lastDrawTime) this.lastDrawTime = 0;
        const timeSinceLastDraw = now - this.lastDrawTime;
        
        // Only redraw every 100ms (10 FPS for map is fine)
        if (timeSinceLastDraw < 100 && this.lastDrawTime > 0) {
            requestAnimationFrame(() => this.draw());
            return;
        }
        this.lastDrawTime = now;

        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;

        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        // Map Settings
        const centerX = width / 2;
        const centerY = height / 2;
        const playerX = this.spaceship.position.x;
        const playerZ = this.spaceship.position.z;
        const playerY = this.spaceship.position.y;

        // Draw Factions (Noise Map) - Reduced resolution for performance
        const range = 400; // Reduced from 600
        const step = 40; // Increased from 30 (lower resolution = faster)

        // Cache faction calculations
        if (!this.factionCache) this.factionCache = new Map();
        const cacheKey = `${Math.floor(playerX / 100)},${Math.floor(playerZ / 100)}`;
        
        for (let x = -range; x <= range; x += step) {
            for (let z = -range; z <= range; z += step) {
                const wx = playerX + x;
                const wz = playerZ + z;
                const gridX = Math.floor(wx / step) * step;
                const gridZ = Math.floor(wz / step) * step;
                const cacheKey2 = `${gridX},${gridZ}`;
                
                let faction;
                if (this.factionCache.has(cacheKey2)) {
                    faction = this.factionCache.get(cacheKey2);
                } else {
                    faction = this.universe.getFaction(wx, playerY, wz);
                    this.factionCache.set(cacheKey2, faction);
                    // Limit cache size
                    if (this.factionCache.size > 1000) {
                        const firstKey = this.factionCache.keys().next().value;
                        this.factionCache.delete(firstKey);
                    }
                }

                let color = '#333'; // Neutral
                if (faction === 'FRIENDLY') color = 'rgba(0, 100, 255, 0.2)';
                if (faction === 'HOSTILE') color = 'rgba(255, 50, 0, 0.2)';

                const sx = centerX + (x * this.scale);
                const sz = centerY + (z * this.scale);

                ctx.fillStyle = color;
                ctx.fillRect(sx, sz, step * this.scale, step * this.scale);
            }
        }

        // Draw Points of Interest
        this.drawPOIs(ctx, centerX, centerY, playerX, playerZ, playerY);

        // Draw Autopilot Target
        if (this.autopilot && this.autopilot.target) {
            const target = this.autopilot.target;
            const tx = centerX + (target.x - playerX) * this.scale;
            const tz = centerY + (target.z - playerZ) * this.scale;
            
            // Draw line to target
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(tx, tz);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw target marker
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(tx, tz, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw distance
            const distance = this.spaceship.position.distanceTo(target);
            ctx.fillStyle = '#00ff00';
            ctx.font = '12px Courier New';
            ctx.fillText(`${Math.floor(distance)}u`, tx + 8, tz);
        }

        // Draw Player
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Player direction indicator
        const dirLength = 15;
        const dirX = centerX + Math.sin(this.spaceship.rotation) * dirLength;
        const dirZ = centerY + Math.cos(this.spaceship.rotation) * dirLength;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(dirX, dirZ);
        ctx.stroke();

        requestAnimationFrame(() => this.draw());
    }
    
    drawPOIs(ctx, centerX, centerY, playerX, playerZ, playerY) {
        // Draw Stations
        this.pointsOfInterest.stations.forEach(poi => {
            const x = centerX + (poi.x - playerX) * this.scale;
            const z = centerY + (poi.z - playerZ) * this.scale;
            ctx.fillStyle = poi.faction === 'FRIENDLY' ? '#00aaff' : poi.faction === 'HOSTILE' ? '#ff3300' : '#888888';
            ctx.beginPath();
            ctx.arc(x, z, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText('🛸', x - 5, z + 15);
        });
        
        // Draw Systems
        this.pointsOfInterest.systems.forEach(poi => {
            const x = centerX + (poi.x - playerX) * this.scale;
            const z = centerY + (poi.z - playerZ) * this.scale;
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(x, z, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw Wormholes
        this.pointsOfInterest.wormholes.forEach(poi => {
            const x = centerX + (poi.x - playerX) * this.scale;
            const z = centerY + (poi.z - playerZ) * this.scale;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, z, 6, 0, Math.PI * 2);
            ctx.stroke();
        });
        
        // Draw Resource Nodes
        this.pointsOfInterest.resourceNodes.forEach(poi => {
            const x = centerX + (poi.x - playerX) * this.scale;
            const z = centerY + (poi.z - playerZ) * this.scale;
            const colors = { metals: '#888888', crystals: '#00ffff', fuel: '#ffff00', scrap: '#ff8800' };
            ctx.fillStyle = colors[poi.resourceType] || '#fff';
            ctx.beginPath();
            ctx.arc(x, z, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw NPC Traders
        this.pointsOfInterest.npcTraders.forEach(poi => {
            const x = centerX + (poi.x - playerX) * this.scale;
            const z = centerY + (poi.z - playerZ) * this.scale;
            ctx.fillStyle = poi.faction === 'FRIENDLY' ? '#00aaff' : '#888888';
            ctx.fillRect(x - 3, z - 3, 6, 6);
        });
    }
}
