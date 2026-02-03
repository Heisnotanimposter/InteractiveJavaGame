export class Input {
    constructor() {
        this.keys = {};
        this.keyPressed = {}; // For one-time keypress events

        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.keyPressed[e.code] = true; // Mark as newly pressed
            }
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keyPressed[e.code] = false;
        });
    }

    isDown(code) {
        return !!this.keys[code];
    }
    
    wasPressed(code) {
        if (this.keyPressed[code]) {
            this.keyPressed[code] = false; // Consume the press
            return true;
        }
        return false;
    }
}
