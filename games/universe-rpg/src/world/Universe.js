import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { SolarSystem } from '../entities/SolarSystem.js';

export class Universe {
    constructor(scene) {
        this.scene = scene;
        this.noise3D = createNoise3D();
        this.factionNoise = createNoise3D(); // Separate noise for factions
        this.chunks = new Map();
        this.chunkSize = 100;
        this.renderDistance = 1; // Reduced from 2 to improve performance
        this.systems = []; // Store active systems to update them
        this.wormholeData = [];
        this.anomalyData = [];
        this.stationData = [];
        this.resourceNodeData = [];
        this.npcTraderData = [];
        
        // Chunk management
        this.loadedChunks = new Set();
        this.chunkLastAccessed = new Map();
        this.maxLoadedChunks = 30; // Reduced from 50 to improve performance
    }

    getFaction(x, y, z) {
        // Low frequency noise for large territories (use 3D noise)
        const scale = 0.005;
        const value = this.factionNoise(x * scale, y * scale, z * scale);
        if (value > 0.3) return 'FRIENDLY';
        if (value < -0.3) return 'HOSTILE';
        return 'NEUTRAL';
    }

    update(playerPosition) {
        const currentChunkX = Math.floor(playerPosition.x / this.chunkSize);
        const currentChunkY = Math.floor(playerPosition.y / this.chunkSize);
        const currentChunkZ = Math.floor(playerPosition.z / this.chunkSize);

        // Mark current chunks as accessed
        const currentTime = Date.now();
        const chunksToKeep = new Set();

        // Load chunks around player in 3D
        for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
            for (let y = -this.renderDistance; y <= this.renderDistance; y++) {
                for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
                    const chunkKey = `${currentChunkX + x},${currentChunkY + y},${currentChunkZ + z}`;
                    chunksToKeep.add(chunkKey);
                    
                    if (!this.chunks.has(chunkKey)) {
                        this.generateChunk(currentChunkX + x, currentChunkY + y, currentChunkZ + z);
                    }
                    
                    // Update access time
                    this.chunkLastAccessed.set(chunkKey, currentTime);
                    this.loadedChunks.add(chunkKey);
                }
            }
        }

        // Unload distant chunks (optimization) - do this less frequently
        if (Math.random() < 0.1) { // Only 10% chance per update
            this.unloadDistantChunks(chunksToKeep, currentTime);
        }

        // Update Systems (Planets orbiting) - only update visible ones
        // Systems update themselves, but we can optimize by culling distant ones
        // For now, let planets update themselves (they're lightweight)
    }
    
    unloadDistantChunks(chunksToKeep, currentTime) {
        const chunksToUnload = [];
        const maxAge = 30000; // 30 seconds
        
        for (const chunkKey of this.loadedChunks) {
            if (!chunksToKeep.has(chunkKey)) {
                const lastAccessed = this.chunkLastAccessed.get(chunkKey) || 0;
                const age = currentTime - lastAccessed;
                
                if (age > maxAge) {
                    chunksToUnload.push(chunkKey);
                }
            }
        }
        
        // Unload oldest chunks if we exceed limit
        if (this.loadedChunks.size > this.maxLoadedChunks) {
            const sortedChunks = Array.from(this.loadedChunks)
                .map(key => ({ key, time: this.chunkLastAccessed.get(key) || 0 }))
                .sort((a, b) => a.time - b.time);
            
            const toRemove = sortedChunks.slice(0, this.loadedChunks.size - this.maxLoadedChunks);
            toRemove.forEach(({ key }) => chunksToUnload.push(key));
        }
        
        // Actually unload chunks
        chunksToUnload.forEach(chunkKey => {
            const chunk = this.chunks.get(chunkKey);
            if (chunk) {
                // Remove systems from this chunk
                this.systems = this.systems.filter(sys => {
                    const sysChunkX = Math.floor(sys.position.x / this.chunkSize);
                    const sysChunkY = Math.floor(sys.position.y / this.chunkSize);
                    const sysChunkZ = Math.floor(sys.position.z / this.chunkSize);
                    const sysChunkKey = `${sysChunkX},${sysChunkY},${sysChunkZ}`;
                    return sysChunkKey !== chunkKey;
                });
                
                this.scene.remove(chunk);
                this.chunks.delete(chunkKey);
                this.loadedChunks.delete(chunkKey);
                this.chunkLastAccessed.delete(chunkKey);
            }
        });
    }

    generateChunk(cx, cy, cz) {
        const chunkGroup = new THREE.Group();

        // Determine Chunk Faction using 3D coordinates
        const chunkFaction = this.getFaction(cx * this.chunkSize, cy * this.chunkSize, cz * this.chunkSize);

        // Generate Solar Systems inside this chunk
        const numSystems = 3; // Reduced from 5 to improve performance
        for (let i = 0; i < numSystems; i++) {
            const hash = (x, y, z) => {
                return Math.abs(Math.sin(x * 12.9898 + y * 78.233 + z * 43.123) * 43758.5453) % 1;
            };

            const rx = hash(cx, cy, i * 1.1);
            const ry = hash(cx, cy, i * 2.2);
            const rz = hash(cx, cy, i * 3.3);

            const x = (cx * this.chunkSize) + (rx * this.chunkSize);
            const y = (cy * this.chunkSize) + (ry * this.chunkSize * 0.5) - (this.chunkSize * 0.25);
            const z = (cz * this.chunkSize) + (rz * this.chunkSize);

            const system = new SolarSystem(this.scene, new THREE.Vector3(x, y, z), chunkFaction);
            this.systems.push(system);
        }

        // Chance to spawn a wormhole (now 3D)
        const wormholeHash = (cx * 123.45 + cy * 456.78 + cz * 678.90) % 1;
        if (Math.abs(wormholeHash) > 0.9) {
            const wx = (cx * this.chunkSize);
            const wy = (cy * this.chunkSize);
            const wz = (cz * this.chunkSize);
            this.addWormhole(wx, wy, wz, chunkGroup);
        }

        // Chance to spawn an Anomaly (now 3D)
        const anomalyHash = (cx * 543.21 + cy * 654.32 + cz * 987.65) % 1;
        if (Math.abs(anomalyHash) > 0.85) {
            const ax = (cx * this.chunkSize) + 50;
            const ay = (cy * this.chunkSize) + 50;
            const az = (cz * this.chunkSize) + 50;
            this.addAnomaly(ax, ay, az, chunkGroup);
        }
        
        // Chance to spawn a Space Station (now 3D)
        const stationHash = (cx * 789.12 + cy * 345.67 + cz * 123.45) % 1;
        if (Math.abs(stationHash) > 0.92) {
            const sx = (cx * this.chunkSize) + (this.chunkSize * 0.5);
            const sy = (cy * this.chunkSize) + (this.chunkSize * 0.5);
            const sz = (cz * this.chunkSize) + (this.chunkSize * 0.5);
            this.addStation(sx, sy, sz, chunkFaction, chunkGroup);
        }
        
        // Spawn resource nodes
        const resourceHash = (cx * 111.22 + cy * 333.44 + cz * 555.66) % 1;
        if (Math.abs(resourceHash) > 0.7) {
            const rx = (cx * this.chunkSize) + Math.random() * this.chunkSize;
            const ry = (cy * this.chunkSize) + Math.random() * this.chunkSize;
            const rz = (cz * this.chunkSize) + Math.random() * this.chunkSize;
            const resourceTypes = ['metals', 'crystals', 'fuel', 'scrap'];
            const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
            this.addResourceNode(rx, ry, rz, resourceType, chunkGroup);
        }
        
        // Spawn NPC traders (rare)
        const npcHash = (cx * 999.11 + cy * 777.22 + cz * 333.33) % 1;
        if (Math.abs(npcHash) > 0.95) {
            const nx = (cx * this.chunkSize) + Math.random() * this.chunkSize;
            const ny = (cy * this.chunkSize) + Math.random() * this.chunkSize;
            const nz = (cz * this.chunkSize) + Math.random() * this.chunkSize;
            this.addNPCTrader(nx, ny, nz, chunkFaction, chunkGroup);
        }

        // Add to scene and map
        this.scene.add(chunkGroup);
        this.chunks.set(`${cx},${cy},${cz}`, chunkGroup);
    }

    addWormhole(x, y, z, group) {
        this.wormholeData.push({ x, y, z, group });
    }

    addAnomaly(x, y, z, group) {
        this.anomalyData.push({ x, y, z, group });
    }
    
    addStation(x, y, z, faction, group) {
        this.stationData.push({ x, y, z, faction, group });
    }
    
    addResourceNode(x, y, z, resourceType, group) {
        this.resourceNodeData.push({ x, y, z, resourceType, group });
    }
    
    addNPCTrader(x, y, z, faction, group) {
        this.npcTraderData.push({ x, y, z, faction, group });
    }
    
    getAllPointsOfInterest() {
        return {
            stations: this.stationData.map(s => ({ x: s.x, y: s.y, z: s.z, type: 'station', faction: s.faction })),
            systems: this.systems.map(s => ({ x: s.position.x, y: s.position.y, z: s.position.z, type: 'system', faction: s.faction })),
            wormholes: this.wormholeData.map(w => ({ x: w.x, y: w.y, z: w.z, type: 'wormhole' })),
            resourceNodes: this.resourceNodeData.map(r => ({ x: r.x, y: r.y, z: r.z, type: 'resource', resourceType: r.resourceType })),
            npcTraders: this.npcTraderData.map(n => ({ x: n.x, y: n.y, z: n.z, type: 'npc', faction: n.faction }))
        };
    }

    updateEnvironment(scene, position) {
        // Change background/fog based on deep space coordinates (use max of any axis)
        const dist = Math.max(Math.abs(position.x), Math.abs(position.y), Math.abs(position.z));
        if (dist > 100000) {
            // Deep Space: Reddish fog, darker
            scene.fog.color.setHex(0x220000);
            scene.fog.density = 0.0008;
            scene.background = new THREE.Color(0x110000);
        } else if (dist > 50000) {
            // Mid Space: Blueish fog
            scene.fog.color.setHex(0x000022);
            scene.fog.density = 0.0006;
            scene.background = new THREE.Color(0x000011);
        } else {
            // Normal Space
            scene.fog.color.setHex(0x000000);
            scene.fog.density = 0.0005;
            scene.background = new THREE.Color(0x000000);
        }
    }
}
