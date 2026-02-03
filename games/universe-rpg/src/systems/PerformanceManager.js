export class PerformanceManager {
    constructor() {
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fps = 60;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        this.deltaTime = 0;
        
        // Update throttling
        this.updateIntervals = {
            map: 100, // Update map every 100ms
            distantEntities: 500, // Update distant entities every 500ms
            ui: 50, // Update UI every 50ms
            chunkGeneration: 200 // Generate chunks every 200ms
        };
        
        this.lastUpdateTimes = {
            map: 0,
            distantEntities: 0,
            ui: 0,
            chunkGeneration: 0
        };
    }
    
    update() {
        const now = performance.now();
        this.deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        // Calculate FPS
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            this.fps = Math.round(1000 / this.deltaTime);
        }
        
        // Cap delta time to prevent huge jumps
        if (this.deltaTime > 100) {
            this.deltaTime = 100;
        }
    }
    
    shouldUpdate(type) {
        const now = performance.now();
        const interval = this.updateIntervals[type];
        const lastUpdate = this.lastUpdateTimes[type] || 0;
        
        if (now - lastUpdate >= interval) {
            this.lastUpdateTimes[type] = now;
            return true;
        }
        return false;
    }
    
    getDeltaTime() {
        return Math.min(this.deltaTime / 16.67, 2.0); // Normalize to ~60fps, cap at 2x
    }
    
    getFPS() {
        return this.fps;
    }
}

