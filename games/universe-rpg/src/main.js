import * as THREE from 'three';
import { Universe } from './world/Universe.js';
import { Spaceship } from './entities/Spaceship.js';
import { Input } from './engine/Input.js';

import { Wormhole } from './entities/Wormhole.js';
import { WorldMap } from './ui/WorldMap.js';
import { Anomaly } from './entities/Anomaly.js';
import { EventManager } from './engine/EventManager.js';
import { SpaceStation } from './entities/SpaceStation.js';
import { EnemyShip } from './entities/EnemyShip.js';
import { PlanetLanding } from './entities/PlanetLanding.js';
import { PlayerStats } from './systems/PlayerStats.js';
import { MissionSystem } from './systems/MissionSystem.js';
import { TradeMenu } from './ui/TradeMenu.js';
import { UpgradeMenu } from './ui/UpgradeMenu.js';
import { MissionMenu } from './ui/MissionMenu.js';
import { AxisIndicator } from './ui/AxisIndicator.js';
import { Autopilot } from './systems/Autopilot.js';
import { ResourceNode } from './entities/ResourceNode.js';
import { NPCTrader } from './entities/NPCTrader.js';
import { PerformanceManager } from './systems/PerformanceManager.js';

class Game {
    constructor() {
        this.container = document.getElementById('game-container');

        // Scene Setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0005); // Distance fog

        // Camera Setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.set(0, 20, 20);
        this.camera.lookAt(0, 0, 0);

        // Renderer Setup - Reduced quality for performance
        this.renderer = new THREE.WebGLRenderer({ antialias: false }); // Disabled antialiasing
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap pixel ratio
        this.container.appendChild(this.renderer.domElement);

        // Core Systems
        this.input = new Input();
        this.playerStats = new PlayerStats();
        this.missionSystem = new MissionSystem(this.playerStats);
        this.performanceManager = new PerformanceManager();
        this.universe = new Universe(this.scene);
        this.spaceship = new Spaceship(this.scene, this.playerStats);
        this.wormholes = [];
        this.anomalies = [];
        this.spaceStations = [];
        this.enemyShips = [];
        this.resourceNodes = [];
        this.npcTraders = [];
        this.autopilot = new Autopilot(this.spaceship);
        this.worldMap = new WorldMap(this.universe, this.spaceship, this.autopilot);
        this.eventManager = new EventManager(this.playerStats, this.missionSystem);
        
        // Combat
        this.spaceship.shield = this.playerStats.shipStats.shieldCapacity;
        this.spaceship.maxShield = this.playerStats.shipStats.shieldCapacity;
        
        // UI Menus
        this.tradeMenu = new TradeMenu();
        this.upgradeMenu = new UpgradeMenu();
        this.missionMenu = new MissionMenu();
        this.axisIndicator = new AxisIndicator(this.scene, this.spaceship);
        
        // Interaction state
        this.nearStation = null;
        this.nearPlanet = null;
        this.nearNPCTrader = null;
        this.lastInteractionTime = 0;
        this.lastLandingTime = 0;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        // Handle Resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Keyboard Controls
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyM') {
                this.worldMap.toggle();
            }
            if (e.code === 'KeyI') {
                this.axisIndicator.toggle();
            }
            if (e.code === 'KeyU' && !this.upgradeMenu.visible) {
                this.upgradeMenu.open(this.playerStats);
            }
            if (e.code === 'KeyJ' && !this.missionMenu.visible) {
                this.missionMenu.open(this.missionSystem, this.playerStats);
            }
            // E and F/L are now handled in animate loop for better reliability
            if (e.code === 'KeyP') {
                // Toggle autopilot
                if (this.autopilot.active) {
                    this.autopilot.cancel();
                }
            }
            if (e.code === 'KeyT' && this.nearNPCTrader) {
                // Trade with NPC
                this.openNPCTraderMenu(this.nearNPCTrader);
            }
        });

        // Start Loop
        this.animate();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Performance tracking
        this.performanceManager.update();
        const deltaTime = this.performanceManager.getDeltaTime();
        
        // Only update universe chunks periodically to reduce load
        if (this.performanceManager.shouldUpdate('chunkGeneration')) {
            this.universe.update(this.spaceship.position);
        }
        
        // Update Logic - only pass nearby systems
        const nearbySystems = this.getNearbySystems(this.spaceship.position, 200);
        this.spaceship.update(this.input, nearbySystems);
        
        // Update environment less frequently
        if (this.performanceManager.shouldUpdate('ui')) {
            this.universe.updateEnvironment(this.scene, this.spaceship.position);
        }
        
        // Shield regeneration (slow regen when not taking damage)
        if (this.spaceship.shield < this.spaceship.maxShield) {
            this.spaceship.shield = Math.min(
                this.spaceship.maxShield,
                this.spaceship.shield + 0.05 // Slow regen
            );
        }

        // Check for new wormholes from universe generation
        if (this.universe.wormholeData && this.universe.wormholeData.length > 0) {
            while (this.universe.wormholeData.length > 0) {
                const data = this.universe.wormholeData.pop();
                const wh = new Wormhole(this.scene, new THREE.Vector3(data.x, data.y, data.z));
                this.wormholes.push(wh);
            }
        }

        // Check for new anomalies
        if (this.universe.anomalyData && this.universe.anomalyData.length > 0) {
            while (this.universe.anomalyData.length > 0) {
                const data = this.universe.anomalyData.pop();
                const an = new Anomaly(this.scene, new THREE.Vector3(data.x, data.y, data.z));
                this.anomalies.push(an);
            }
        }
        
        // Check for new space stations
        if (this.universe.stationData && this.universe.stationData.length > 0) {
            while (this.universe.stationData.length > 0) {
                const data = this.universe.stationData.pop();
                const station = new SpaceStation(this.scene, new THREE.Vector3(data.x, data.y, data.z), data.faction);
                this.spaceStations.push(station);
            }
        }
        
        // Check for new resource nodes
        if (this.universe.resourceNodeData && this.universe.resourceNodeData.length > 0) {
            while (this.universe.resourceNodeData.length > 0) {
                const data = this.universe.resourceNodeData.pop();
                const node = new ResourceNode(this.scene, new THREE.Vector3(data.x, data.y, data.z), data.resourceType);
                this.resourceNodes.push(node);
            }
        }
        
        // Check for new NPC traders
        if (this.universe.npcTraderData && this.universe.npcTraderData.length > 0) {
            while (this.universe.npcTraderData.length > 0) {
                const data = this.universe.npcTraderData.pop();
                const trader = new NPCTrader(this.scene, new THREE.Vector3(data.x, data.y, data.z), data.faction);
                this.npcTraders.push(trader);
            }
        }

        // Spawn Anomalies Randomly (Simple logic for now)
        if (Math.random() < 0.001) { // Rare chance per frame, bad logic but works for prototype
            // Better: Spawn in Universe generation. But let's just spawn one near player for testing.
            // Actually, let's spawn them in Universe generation like wormholes.
        }

        // Update Wormholes and Check Collisions (only nearby ones)
        this.wormholes.forEach(wh => {
            const distance = this.spaceship.position.distanceTo(wh.position);
            if (distance < 500) { // Only update within 500 units
                wh.update();
                if (distance < 4 && wh.checkCollision(this.spaceship.position)) {
                    this.jumpDimension();
                }
            }
        });

        // Update Anomalies (only nearby ones)
        for (let i = this.anomalies.length - 1; i >= 0; i--) {
            const an = this.anomalies[i];
            const distance = this.spaceship.position.distanceTo(an.position);
            if (distance < 500) { // Only update within 500 units
                an.update();
                if (distance < 3 && an.checkCollision(this.spaceship.position)) {
                    this.eventManager.triggerAnomaly(this.spaceship.position);
                    this.scene.remove(an.mesh);
                    this.anomalies.splice(i, 1);
                }
            }
        }
        
        // Update Autopilot
        if (this.autopilot.active) {
            const autopilotStatus = this.autopilot.update();
            if (autopilotStatus && autopilotStatus.arrived) {
                // Arrived at destination
                console.log("Autopilot: Arrived at destination");
            }
        }
        
        // Update Space Stations (only nearby ones)
        this.nearStation = null;
        this.spaceStations.forEach(station => {
            const distance = this.spaceship.position.distanceTo(station.position);
            if (distance < 500) { // Only update within 500 units
                station.update();
                if (distance < 15 && station.checkCollision(this.spaceship.position)) {
                    this.nearStation = station;
                }
            }
        });
        
        // Update Resource Nodes (only nearby ones)
        for (let i = this.resourceNodes.length - 1; i >= 0; i--) {
            const node = this.resourceNodes[i];
            if (node.collected) continue;
            
            const distance = this.spaceship.position.distanceTo(node.position);
            if (distance < 300) { // Only update within 300 units
                node.update();
                if (distance < 3 && node.checkCollision(this.spaceship.position)) {
                    const result = node.collect(this.playerStats);
                    if (result.success) {
                        this.playerStats.addExperience(10);
                        this.resourceNodes.splice(i, 1);
                    }
                }
            }
        }
        
        // Update NPC Traders (only nearby ones, less frequently)
        this.nearNPCTrader = null;
        if (this.performanceManager.shouldUpdate('distantEntities')) {
            this.npcTraders.forEach(trader => {
                const distance = this.spaceship.position.distanceTo(trader.position);
                if (distance < 500) {
                    trader.update();
                    if (distance < 20 && trader.checkCollision(this.spaceship.position)) {
                        this.nearNPCTrader = trader;
                    }
                }
            });
        } else {
            // Just check collision for nearby traders
            this.npcTraders.forEach(trader => {
                const distance = this.spaceship.position.distanceTo(trader.position);
                if (distance < 20 && trader.checkCollision(this.spaceship.position)) {
                    this.nearNPCTrader = trader;
                }
            });
        }
        
        // Check for E key press to interact with station (check in animate loop for reliability)
        if (this.input.wasPressed('KeyE') && this.nearStation) {
            const now = Date.now();
            if (now - this.lastInteractionTime > 500) {
                this.openStationMenu(this.nearStation);
                this.lastInteractionTime = now;
            }
        }
        
        // Check for F/L key press to land on planet
        if ((this.input.wasPressed('KeyF') || this.input.wasPressed('KeyL')) && this.nearPlanet) {
            const now = Date.now();
            if (now - this.lastLandingTime > 1000) {
                this.attemptLanding();
                this.lastLandingTime = now;
            }
        }
        
        // Update Enemy Ships (only active ones)
        for (let i = this.enemyShips.length - 1; i >= 0; i--) {
            const enemy = this.enemyShips[i];
            const distance = this.spaceship.position.distanceTo(enemy.position);
            
            if (distance < 200) { // Only update within 200 units
                enemy.update(this.spaceship.position);
                
                // Enemy attacks
                if (distance < 30) {
                    const damage = enemy.attack(this.spaceship.position);
                    if (damage > 0) {
                        this.takeDamage(damage);
                    }
                }
                
                // Player attacks (spacebar when near)
                if (this.input.isDown('Space') && distance < 20) {
                    if (this.playerStats.shipStats.weaponDamage > 0) {
                        const destroyed = enemy.takeDamage(this.playerStats.shipStats.weaponDamage);
                        if (destroyed) {
                            this.playerStats.addCredits(50);
                            this.playerStats.addExperience(25);
                            this.enemyShips.splice(i, 1);
                        }
                    }
                }
            }
        }
        
        // Spawn enemies in hostile territory (less frequently)
        if (Math.random() < 0.0002 && this.enemyShips.length < 2) {
            const faction = this.universe.getFaction(this.spaceship.position.x, this.spaceship.position.y, this.spaceship.position.z);
            if (faction === 'HOSTILE') {
                const offset = new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 100
                );
                const enemyPos = this.spaceship.position.clone().add(offset);
                const enemy = new EnemyShip(this.scene, enemyPos, faction);
                this.enemyShips.push(enemy);
            }
        }
        
        // Planet landing detection (only check nearby systems)
        this.nearPlanet = null;
        const nearbySystemsForLanding = this.getNearbySystems(this.spaceship.position, 100);
        nearbySystemsForLanding.forEach(system => {
            system.planets.forEach(planet => {
                const landing = new PlanetLanding(planet, this.scene);
                if (landing.checkLanding(this.spaceship.position)) {
                    this.nearPlanet = { planet, landing };
                }
            });
        });
        
        // Update Mission System (less frequently)
        if (this.performanceManager.shouldUpdate('ui')) {
            this.missionSystem.checkMissionProximity(this.spaceship.position);
        }
        
        // Update nearby solar systems (planets orbiting)
        const nearbySystemsForUpdate = this.getNearbySystems(this.spaceship.position, 300);
        nearbySystemsForUpdate.forEach(system => {
            if (system.update) {
                system.update(this.spaceship.position);
            }
        });
        
        // Discover systems (check less frequently)
        if (this.performanceManager.shouldUpdate('ui')) {
            nearbySystemsForUpdate.forEach(system => {
                const dist = this.spaceship.position.distanceTo(system.position);
                if (dist < 200 && !this.playerStats.discoveredSystems.has(system.position)) {
                    this.playerStats.discoveredSystems.add(system.position);
                    this.playerStats.addExperience(10);
                }
            });
        }

        // Update Axis Indicator (only if visible)
        if (this.axisIndicator.visible) {
            this.axisIndicator.update();
        }

        // Camera Follow
        this.updateCamera();

        // Render
        this.renderer.render(this.scene, this.camera);

        // Update UI (throttled)
        if (this.performanceManager.shouldUpdate('ui')) {
            this.updateUI();
        }
        
        // Adaptive quality - reduce render distance if FPS is low
        const fps = this.performanceManager.getFPS();
        if (fps < 30 && this.universe.renderDistance > 1) {
            this.universe.renderDistance = 1;
        } else if (fps > 50 && this.universe.renderDistance < 2) {
            this.universe.renderDistance = 2;
        }
    }
    
    getNearbySystems(position, maxDistance) {
        const nearby = [];
        const maxDistSq = maxDistance * maxDistance;
        
        for (const system of this.universe.systems) {
            const distSq = position.distanceToSquared(system.position);
            if (distSq < maxDistSq) {
                nearby.push(system);
            }
        }
        
        return nearby;
    }
    
    attemptLanding() {
        if (!this.nearPlanet) return;
        
        const result = this.nearPlanet.landing.land(this.playerStats);
        
        // Show result in a better way than alert
        const landingModal = document.createElement('div');
        landingModal.style.position = 'absolute';
        landingModal.style.top = '50%';
        landingModal.style.left = '50%';
        landingModal.style.transform = 'translate(-50%, -50%)';
        landingModal.style.backgroundColor = 'rgba(0, 20, 40, 0.95)';
        landingModal.style.border = '2px solid #00aaff';
        landingModal.style.padding = '20px';
        landingModal.style.color = '#fff';
        landingModal.style.zIndex = '100';
        landingModal.style.fontFamily = 'Courier New, monospace';
        landingModal.style.minWidth = '300px';
        landingModal.innerHTML = `
            <h2 style="margin-top: 0; color: #00aaff;">Planet Landing</h2>
            <p>${result.message}</p>
            <button id="landing-close" style="background:#00aaff; border:none; padding:10px 20px; color:white; cursor:pointer; margin-top: 10px;">Close</button>
        `;
        document.body.appendChild(landingModal);
        
        document.getElementById('landing-close').addEventListener('click', () => {
            document.body.removeChild(landingModal);
        });
    }
    
    openNPCTraderMenu(trader) {
        const menu = document.createElement('div');
        menu.id = 'npc-trader-menu';
        menu.style.position = 'absolute';
        menu.style.top = '50%';
        menu.style.left = '50%';
        menu.style.transform = 'translate(-50%, -50%)';
        menu.style.backgroundColor = 'rgba(0, 20, 40, 0.95)';
        menu.style.border = '2px solid #00aaff';
        menu.style.padding = '20px';
        menu.style.color = '#fff';
        menu.style.zIndex = '100';
        menu.style.fontFamily = 'Courier New, monospace';
        menu.style.minWidth = '500px';
        
        const goods = trader.tradeGoods;
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #00aaff;">NPC Trader - ${trader.faction}</h2>
                <button id="npc-close" style="background:#ff3300; border:none; padding:8px 15px; color:white; cursor:pointer; font-size:14px;">Close</button>
            </div>
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(0, 50, 100, 0.3); border: 1px solid #00aaff;">
                <div>Your Credits: <span style="color: #00ff00;">${Math.floor(this.playerStats.credits)}</span></div>
                <div>Trader Credits: <span style="color: #00ff00;">${Math.floor(trader.credits)}</span></div>
                <div>Cargo: ${this.playerStats.getTotalCargo()} / ${this.playerStats.shipStats.cargoCapacity}</div>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 1px solid #00aaff;">
                        <th style="text-align: left; padding: 8px;">Item</th>
                        <th style="text-align: center; padding: 8px;">You Have</th>
                        <th style="text-align: center; padding: 8px;">Buy Price</th>
                        <th style="text-align: center; padding: 8px;">Sell Price</th>
                        <th style="text-align: center; padding: 8px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        for (const [item, prices] of Object.entries(goods)) {
            const amount = this.playerStats.resources[item] || 0;
            html += `
                <tr style="border-bottom: 1px solid #004466;">
                    <td style="padding: 8px; text-transform: capitalize;">${item}</td>
                    <td style="padding: 8px; text-align: center;">${amount}</td>
                    <td style="padding: 8px; text-align: center; color: #00ff00;">${prices.buy}₵</td>
                    <td style="padding: 8px; text-align: center; color: #ffaa00;">${prices.sell}₵</td>
                    <td style="padding: 8px; text-align: center;">
                        <button class="npc-buy" data-item="${item}" style="background:#00aa00; border:none; padding:5px 10px; color:white; cursor:pointer; margin-right:5px; font-size:12px;">Buy</button>
                        <button class="npc-sell" data-item="${item}" style="background:#aa0000; border:none; padding:5px 10px; color:white; cursor:pointer; font-size:12px;">Sell</button>
                    </td>
                </tr>
            `;
        }
        
        html += `
                </tbody>
            </table>
        `;
        
        menu.innerHTML = html;
        document.body.appendChild(menu);
        
        document.getElementById('npc-close').addEventListener('click', () => {
            document.body.removeChild(menu);
        });
        
        menu.querySelectorAll('.npc-buy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.dataset.item;
                const result = trader.trade(this.playerStats, item, 'buy');
                if (result.success) {
                    this.updateNPCTraderMenu(menu, trader);
                } else {
                    alert(result.reason);
                }
            });
        });
        
        menu.querySelectorAll('.npc-sell').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.dataset.item;
                const result = trader.trade(this.playerStats, item, 'sell');
                if (result.success) {
                    this.updateNPCTraderMenu(menu, trader);
                } else {
                    alert(result.reason);
                }
            });
        });
    }
    
    updateNPCTraderMenu(menu, trader) {
        // Update credits display
        const creditsDiv = menu.querySelector('div');
        if (creditsDiv) {
            creditsDiv.innerHTML = `
                <div>Your Credits: <span style="color: #00ff00;">${Math.floor(this.playerStats.credits)}</span></div>
                <div>Trader Credits: <span style="color: #00ff00;">${Math.floor(trader.credits)}</span></div>
                <div>Cargo: ${this.playerStats.getTotalCargo()} / ${this.playerStats.shipStats.cargoCapacity}</div>
            `;
        }
        
        // Update resource amounts
        const rows = menu.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            const item = Object.keys(trader.tradeGoods)[index];
            const amount = this.playerStats.resources[item] || 0;
            const amountCell = row.querySelector('td:nth-child(2)');
            if (amountCell) {
                amountCell.innerText = amount;
            }
        });
    }

    jumpDimension() {
        // Reset position or change seed
        // For visual effect, let's just teleport far away for now, effectively a new area
        // In a real implementation, we'd change the universe seed.

        // Simple "jump": Move 1,000,000 units away
        this.spaceship.position.add(new THREE.Vector3(100000, 0, 100000));
        
        // Reward for using wormhole
        this.playerStats.addExperience(25);
        this.playerStats.addCredits(50);

        // Clear old chunks (Universe will handle generating new ones, but we might want to clear old ones to save memory)
        // For this prototype, we rely on Universe to just generate new ones.

        console.log("JUMPED DIMENSION!");
    }
    
    takeDamage(amount) {
        // Apply to shield first
        if (this.spaceship.shield > 0) {
            this.spaceship.shield -= amount;
            if (this.spaceship.shield < 0) {
                this.spaceship.energy += this.spaceship.shield; // Negative shield becomes energy damage
                this.spaceship.shield = 0;
            }
        } else {
            this.spaceship.energy -= amount;
        }
        
        // Update shield from stats
        this.spaceship.maxShield = this.playerStats.shipStats.shieldCapacity;
        if (this.spaceship.shield > this.spaceship.maxShield) {
            this.spaceship.shield = this.spaceship.maxShield;
        }
        
        // Clamp energy
        this.spaceship.energy = Math.max(0, this.spaceship.energy);
    }
    
    openStationMenu(station) {
        // Show station interaction menu
        const options = station.getInteractionOptions();
        const menu = document.createElement('div');
        menu.id = 'station-menu';
        menu.style.position = 'absolute';
        menu.style.top = '50%';
        menu.style.left = '50%';
        menu.style.transform = 'translate(-50%, -50%)';
        menu.style.backgroundColor = 'rgba(0, 20, 40, 0.95)';
        menu.style.border = '2px solid #00aaff';
        menu.style.padding = '20px';
        menu.style.color = '#fff';
        menu.style.zIndex = '100';
        menu.style.fontFamily = 'Courier New, monospace';
        
        let html = `<h2 style="margin-top:0; color: #00aaff;">Space Station - ${station.faction}</h2>`;
        html += `<div style="margin-bottom: 15px;">Reputation: ${this.playerStats.getReputationStatus(station.faction)} (${this.playerStats.reputation[station.faction]})</div>`;
        
        if (options.trade) {
            html += `<button id="station-trade" style="background:#00aa00; border:none; padding:10px 20px; color:white; cursor:pointer; margin:5px; display:block; width:100%;">Trade</button>`;
        }
        if (options.missions) {
            html += `<button id="station-missions" style="background:#00aaff; border:none; padding:10px 20px; color:white; cursor:pointer; margin:5px; display:block; width:100%;">Mission Board</button>`;
        }
        if (options.upgrade) {
            html += `<button id="station-upgrade" style="background:#aa00aa; border:none; padding:10px 20px; color:white; cursor:pointer; margin:5px; display:block; width:100%;">Upgrade Ship</button>`;
        }
        if (options.repair) {
            const repairCost = Math.floor((this.spaceship.maxEnergy - this.spaceship.energy) * 2);
            html += `<button id="station-repair" style="background:#ffaa00; border:none; padding:10px 20px; color:white; cursor:pointer; margin:5px; display:block; width:100%;">Repair (${repairCost}₵)</button>`;
        }
        html += `<button id="station-close" style="background:#ff3300; border:none; padding:10px 20px; color:white; cursor:pointer; margin:5px; display:block; width:100%;">Close</button>`;
        
        menu.innerHTML = html;
        document.body.appendChild(menu);
        
        // Event listeners
        if (options.trade) {
            document.getElementById('station-trade').addEventListener('click', () => {
                document.body.removeChild(menu);
                this.tradeMenu.open(station, this.playerStats);
            });
        }
        if (options.missions) {
            document.getElementById('station-missions').addEventListener('click', () => {
                // Generate missions if needed
                if (this.missionSystem.availableMissions.length === 0) {
                    for (let i = 0; i < 3; i++) {
                        const mission = this.missionSystem.generateMission(station.faction, this.spaceship.position);
                        this.missionSystem.availableMissions.push(mission);
                    }
                }
                document.body.removeChild(menu);
                this.missionMenu.open(this.missionSystem, this.playerStats);
            });
        }
        if (options.upgrade) {
            document.getElementById('station-upgrade').addEventListener('click', () => {
                document.body.removeChild(menu);
                this.upgradeMenu.open(this.playerStats);
            });
        }
        if (options.repair) {
            document.getElementById('station-repair').addEventListener('click', () => {
                const repairCost = Math.floor((this.spaceship.maxEnergy - this.spaceship.energy) * 2);
                if (this.playerStats.spendCredits(repairCost)) {
                    this.spaceship.energy = this.spaceship.maxEnergy;
                    document.body.removeChild(menu);
                } else {
                    alert('Not enough credits!');
                }
            });
        }
        document.getElementById('station-close').addEventListener('click', () => {
            document.body.removeChild(menu);
        });
    }

    updateCamera() {
        // Simple top-down/isometric follow for now
        const offset = new THREE.Vector3(0, 30, 20);
        this.camera.position.copy(this.spaceship.position).add(offset);
        this.camera.lookAt(this.spaceship.position);
    }

    updateUI() {
        const coords = document.getElementById('coordinates');
        const speedEl = document.getElementById('speed');
        const statusEl = document.getElementById('system-status');
        const energyBar = document.getElementById('energy-bar');

        const p = this.spaceship.position;
        const v = this.spaceship.velocity.length();

        coords.innerText = `Pos: ${Math.round(p.x)}, ${Math.round(p.y)}, ${Math.round(p.z)}`;
        speedEl.innerText = `Speed: ${v.toFixed(2)} | Level: ${this.playerStats.level} | Credits: ${Math.floor(this.playerStats.credits)}₵`;

        const energyPercent = (this.spaceship.energy / this.spaceship.maxEnergy) * 100;
        energyBar.style.width = `${energyPercent}%`;

        // Status Logic
        let statusText = "Status: NOMINAL";
        let statusColor = '#00ff00';
        
        if (energyPercent < 20) {
            energyBar.style.backgroundColor = '#ff0000';
            statusText = "Status: LOW ENERGY";
            statusColor = '#ff0000';
        } else {
            energyBar.style.backgroundColor = '#00ffff';
        }

        if (this.spaceship.rechargeRate > 0) {
            statusText += " (CHARGING)";
            statusColor = '#ffff00';
        }
        
        // Interaction prompts
        const interactionPrompt = document.getElementById('interaction-prompt');
        if (!interactionPrompt) {
            const promptDiv = document.createElement('div');
            promptDiv.id = 'interaction-prompt';
            promptDiv.style.position = 'absolute';
            promptDiv.style.top = '50%';
            promptDiv.style.left = '50%';
            promptDiv.style.transform = 'translate(-50%, -50%)';
            promptDiv.style.color = '#00aaff';
            promptDiv.style.fontSize = '24px';
            promptDiv.style.fontWeight = 'bold';
            promptDiv.style.textShadow = '0 0 10px #00aaff, 0 0 20px #00aaff';
            promptDiv.style.zIndex = '5';
            promptDiv.style.pointerEvents = 'none';
            promptDiv.style.fontFamily = 'Courier New, monospace';
            document.getElementById('ui-layer').appendChild(promptDiv);
        }
        
        const promptEl = document.getElementById('interaction-prompt');
        if (this.nearStation) {
            statusText += " | [E] Station Nearby";
            statusColor = '#00aaff';
            promptEl.innerText = '[E] INTERACT WITH STATION';
            promptEl.style.display = 'block';
        } else if (this.nearNPCTrader) {
            promptEl.innerText = '[T] TRADE WITH NPC';
            promptEl.style.display = 'block';
        } else if (this.nearPlanet) {
            statusText += " | [F/L] Planet Nearby";
            if (statusColor === '#00ff00') statusColor = '#ffff00';
            promptEl.innerText = '[F] or [L] LAND ON PLANET';
            promptEl.style.display = 'block';
        } else {
            promptEl.style.display = 'none';
        }
        
        if (this.enemyShips.length > 0) {
            statusText += ` | ${this.enemyShips.length} Enemy(s)`;
            statusColor = '#ff0000';
        }
        
        // Shield display
        const shieldEl = document.getElementById('shield-bar');
        if (!shieldEl && this.spaceship.maxShield > 0) {
            const shieldContainer = document.createElement('div');
            shieldContainer.className = 'bar-container';
            shieldContainer.innerHTML = `
                <div class="bar-label">SHIELD</div>
                <div class="bar-bg">
                    <div id="shield-bar" class="bar-fill" style="background-color: #00ff00;"></div>
                </div>
            `;
            document.getElementById('hud-bottom-left').appendChild(shieldContainer);
        }
        if (shieldEl) {
            const shieldPercent = (this.spaceship.shield / this.spaceship.maxShield) * 100;
            shieldEl.style.width = `${shieldPercent}%`;
            if (shieldPercent < 30) {
                shieldEl.style.backgroundColor = '#ff0000';
            } else if (shieldPercent < 60) {
                shieldEl.style.backgroundColor = '#ffaa00';
            } else {
                shieldEl.style.backgroundColor = '#00ff00';
            }
        }
        
        statusEl.innerText = statusText;
        statusEl.style.color = statusColor;
        
        // Update additional UI elements if they exist
        const cargoEl = document.getElementById('cargo-display');
        if (!cargoEl) {
            const cargoDiv = document.createElement('div');
            cargoDiv.id = 'cargo-display';
            cargoDiv.style.position = 'absolute';
            cargoDiv.style.top = '80px';
            cargoDiv.style.left = '20px';
            cargoDiv.style.fontSize = '14px';
            cargoDiv.style.textShadow = '0 0 5px #000';
            document.getElementById('hud-top-left').appendChild(cargoDiv);
        }
        const cargoDisplay = document.getElementById('cargo-display');
        if (cargoDisplay) {
            const totalCargo = this.playerStats.getTotalCargo();
            cargoDisplay.innerText = `Cargo: ${totalCargo}/${this.playerStats.shipStats.cargoCapacity}`;
            if (totalCargo >= this.playerStats.shipStats.cargoCapacity * 0.9) {
                cargoDisplay.style.color = '#ff0000';
            } else {
                cargoDisplay.style.color = '#00ffff';
            }
        }
    }
}

// Initialize Game
new Game();
