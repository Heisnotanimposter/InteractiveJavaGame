import * as THREE from 'three';

export class AxisIndicator {
    constructor(scene, spaceship) {
        this.scene = scene;
        this.spaceship = spaceship;
        this.visible = false;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        
        // Create axis lines
        const length = 10;
        const thickness = 0.1;
        
        // X-axis (Red)
        const xGeometry = new THREE.CylinderGeometry(thickness, thickness, length);
        const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.xAxis = new THREE.Mesh(xGeometry, xMaterial);
        this.xAxis.rotation.z = Math.PI / 2;
        this.xAxis.position.x = length / 2;
        this.group.add(this.xAxis);
        
        // Y-axis (Green)
        const yGeometry = new THREE.CylinderGeometry(thickness, thickness, length);
        const yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.yAxis = new THREE.Mesh(yGeometry, yMaterial);
        this.yAxis.position.y = length / 2;
        this.group.add(this.yAxis);
        
        // Z-axis (Blue)
        const zGeometry = new THREE.CylinderGeometry(thickness, thickness, length);
        const zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        this.zAxis = new THREE.Mesh(zGeometry, zMaterial);
        this.zAxis.rotation.x = Math.PI / 2;
        this.zAxis.position.z = length / 2;
        this.group.add(this.zAxis);
        
        // Add arrow heads
        this.createArrowHead(this.xAxis, 0xff0000, new THREE.Vector3(1, 0, 0));
        this.createArrowHead(this.yAxis, 0x00ff00, new THREE.Vector3(0, 1, 0));
        this.createArrowHead(this.zAxis, 0x0000ff, new THREE.Vector3(0, 0, 1));
        
        // Labels (using sprites or text)
        this.group.visible = false;
    }
    
    createArrowHead(parent, color, direction) {
        const coneGeometry = new THREE.ConeGeometry(0.3, 1, 8);
        const coneMaterial = new THREE.MeshBasicMaterial({ color: color });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        
        if (direction.x !== 0) {
            cone.rotation.z = -Math.PI / 2;
            cone.position.x = 5.5;
        } else if (direction.y !== 0) {
            cone.position.y = 5.5;
        } else if (direction.z !== 0) {
            cone.rotation.x = Math.PI / 2;
            cone.position.z = 5.5;
        }
        
        parent.add(cone);
    }
    
    toggle() {
        this.visible = !this.visible;
        this.group.visible = this.visible;
    }
    
    update() {
        if (!this.visible) return;
        
        // Position at spaceship
        this.group.position.copy(this.spaceship.position);
        
        // Rotate to match spaceship orientation
        this.group.rotation.copy(this.spaceship.mesh.rotation);
    }
}

