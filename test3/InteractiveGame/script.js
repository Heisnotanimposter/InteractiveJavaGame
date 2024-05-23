document.addEventListener('DOMContentLoaded', function() {
    let currentAction = 'Standing';
    const character = document.getElementById('character');
    const gameCanvas = document.getElementById('gameCanvas');
    const ctx = gameCanvas.getContext('2d');
    const inventoryItems = {
        redCircle: { 
            name: "Helium",
            info: "atomic number 2, atomic weight 4.002602, melting point	none, boiling point	−268.9 °C (−452 °F), density (1 atm, 0 °C)	0.1785 gram/litre",
            collected: 0
        }
    };
    const circles = [];
    const maxCircles = 8;
    const square = {
        x: 0,
        y: gameCanvas.height / 2 - 25,
        width: 50,
        height: 50,
        speed: 2,
        color: 'blue'
    };
    

    gameCanvas.width = window.innerWidth;
    gameCanvas.height = 300;
    

    function createCircle() {
        return {
            x: Math.random() * (gameCanvas.width - 30),
            y: Math.random() * (gameCanvas.height - 30),
            radius: 15,
            speedX: (Math.random() - 0.5) * 4,
            speedY: (Math.random() - 0.5) * 4,
            color: 'red'
        };
    }

    for (let i = 0; i < maxCircles; i++) {
        circles.push(createCircle());
    }

    function updateInventory() {
        const inventoryContainer = document.getElementById('inventory-container');
        inventoryContainer.innerHTML = '';
        for (const itemKey in inventoryItems) {
            const item = inventoryItems[itemKey];
            const inventoryItem = document.createElement('div');
            inventoryItem.classList.add('inventory-item');
            inventoryItem.dataset.item = itemKey;
            inventoryItem.style.backgroundColor = item.color;
            inventoryItem.textContent = `${item.name} x ${item.collected}`;
            inventoryContainer.appendChild(inventoryItem);
        }
    }

    function animate() {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        circles.forEach((circle, index) => {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
            ctx.fillStyle = circle.color;
            ctx.fill();
            ctx.closePath();
            circle.x += circle.speedX;
            circle.y += circle.speedY;
            if (circle.x + circle.radius > gameCanvas.width || circle.x - circle.radius < 0) {
                circle.speedX = -circle.speedX;
            }
            if (circle.y + circle.radius > gameCanvas.height || circle.y - circle.radius < 0) {
                circle.speedY = -circle.speedY;
            }
            if (isColliding(square, circle)) {
                circles.splice(index, 1);
                inventoryItems.redCircle.collected++;
                updateInventory();
            }
        });
        while (circles.length < maxCircles) {
            circles.push(createCircle());
        }
        ctx.fillStyle = square.color;
        ctx.fillRect(square.x, square.y, square.width, square.height);
        requestAnimationFrame(animate);
    }

    animate();
    updateInventory();

    function isColliding(rect, circle) {
        const distX = Math.abs(circle.x - rect.x - rect.width / 2);
        const distY = Math.abs(circle.y - rect.y - rect.height / 2);
        if (distX > (rect.width / 2 + circle.radius)) return false;
        if (distY > (rect.height / 2 + circle.radius)) return false;
        if (distX <= (rect.width / 2)) return true;
        if (distY <= (rect.height / 2)) return true;
        const dx = distX - rect.width / 2;
        const dy = distY - rect.height / 2;
        return (dx * dx + dy * dy <= (circle.radius * circle.radius));
    }

    document.addEventListener('keydown', function(event) {
        if (currentAction === 'Standing') {
            switch (event.key) {
                case 'ArrowUp':
                    moveCharacter(0, -0.01);
                    setStatus('Moving Up');
                    break;
                case 'ArrowDown':
                    moveCharacter(0, 0.01);
                    setStatus('Moving Down');
                    break;
                case 'ArrowLeft':
                    moveCharacter(-0.01, 0);
                    setStatus('Moving Left');
                    break;
                case 'ArrowRight':
                    moveCharacter(0.01, 0);
                    setStatus('Moving Right');
                    break;
            }
            currentAction = event.key.includes('Arrow') ? 'Moving' : currentAction;
        }
    });
    
    document.addEventListener('keyup', () => {
        if (currentAction !== 'Standing') {
            currentAction = 'Standing';
            setStatus('Standing');
        }
    });

    function moveCharacter(dx, dy) {
        // Get the character element
        const character = document.getElementById('character');
    
        // Get the current position of the character
        var rect = character.getBoundingClientRect();
      
        // Calculate new position
        var newLeft = rect.left + dx;
        var newTop = rect.top + dy;
    
        // Move the character to the new position
        character.style.position = 'absolute';
        character.style.left = newLeft + 'px';
        character.style.top = newTop + 'px';
    }

    function setStatus(action) {
        const statusBar = document.getElementById('status');
        statusBar.innerText = `Status: ${action}`;
        setTimeout(() => statusBar.innerText = 'Status: Standing', 1000);
    }

    function collectResources() {
        setStatus('Collecting resources...');
        alert('Resources collected!');
        for (const circle of circles) {
            if (circle.color === 'red') {
                inventoryItems.redCircle.collected++;
                break;
            }
        }
        updateInventory();
        if (inventoryItems.redCircle.collected >= 2) {
            alert("Phase complete! Prepare for the next phase.");
        }
    }

    function manageSkills() {
        setStatus('Managing skills...');
        const skills = {
            swordfighting: { name: "Swordfighting", level: 1, experience: 0 },
            archery: { name: "Archery", level: 1, experience: 0 },
            defense: { name: "Defense", level: 1, experience: 0 },
            magic: { name: "Magic", level: 1, experience: 0 },
            alchemy: { name: "Alchemy", level: 1, experience: 0 },
            lockpicking: { name: "Lockpicking", level: 1, experience: 0 },
            stealth: { name: "Stealth", level: 1, experience: 0 }
        };
        const skillExperienceThresholds = {
            1: 100,
            2: 200,
            3: 300
        };
        const player = { attackPower: 10, hp: 150 };
        for (const skillKey in skills) {
            while (skills[skillKey].experience >= skillExperienceThresholds[skills[skillKey].level]) {
                skills[skillKey].level++;
                alert(`Your ${skills[skillKey].name} skill has reached level ${skills[skillKey].level}!`);
                if (skillKey === "swordfighting") {
                    player.attackPower += 5;
                }
            }
        }
        let skillDisplay = "Your Skills:\n";
        for (const skillKey in skills) {
            skillDisplay += `- ${skills[skillKey].name}: Level ${skills[skillKey].level} (Experience: ${skills[skillKey].experience}/${skillExperienceThresholds[skills[skillKey].level]})\n`;
        }
        alert(skillDisplay);
    }

    function navigate(screen) {
        const screens = document.querySelectorAll('.content');
        screens.forEach(s => s.style.display = 'none');
        document.getElementById(`${screen}-screen`).style.display = 'block';
        setStatus(`Navigated to ${screen}`);
    }

    function startBattle() {
        setStatus('Starting battle...');
        alert('Battle started!');
        const enemies = [
            { agility: 3, name: 'enemy1', hp: 100 },
            { agility: 2, name: 'enemy2', hp: 80 }
        ];
        const player = { agility: 1, attackPower: 10, hp: 150 };
        let turn = 0;
        const interval = setInterval(() => {
            console.clear();
            console.log('turn ' + turn);
            // Player attacks every turn
            regPlayerAttack();

            // Check if all enemies are dead, end the interval
            if (enemies.every(({ hp }) => hp <= 0)) {
                clearInterval(interval);
                console.log('All enemies defeated! Battle won.');
                setStatus('All enemies defeated! Battle won.');
            } else if (player.hp <= 0) {
                clearInterval(interval);
                console.log('Player is defeated. Game over.');
                setStatus('Player is defeated. Game over.');
            }

            // Enemies attack based on their agility
            enemies
                .filter(({ agility }) => turn % agility === 0)
                .forEach(enemy => enemyAttack(enemy));
            
            turn++;
        }, 1000);

        function regPlayerAttack() {
            const target = enemies.find(enemy => enemy.hp > 0);
            if (target) {
                target.hp -= player.attackPower;
                console.log(`Player attacked ${target.name} for ${player.attackPower} damage. ${target.name} has ${target.hp} HP left.`);
            }
        }

        function enemyAttack(enemy) {
            const enemyAttackPower = 5; // Define enemy attack power
            player.hp -= enemyAttackPower;
            console.log(`${enemy.name} attacked Player for ${enemyAttackPower} damage. Player has ${player.hp} HP left.`);
        }
    }

    function interactButton(id) {
        const adjacentButtons = getAdjacentButtons(id);
        adjacentButtons.forEach(buttonId => {
            document.getElementById(`pentagon${buttonId}`).style.backgroundColor = '#FFD700';
        });
        document.getElementById('reward-box').classList.remove('hidden');
        document.getElementById('reward-box').style.display = 'block';
    }

    function getAdjacentButtons(id) {
        const adjacencyMap = {
            1: [2, 4],
            2: [1, 3, 5],
            3: [2, 4],
            4: [1, 3, 5],
            5: [2, 4]
        };
        return adjacencyMap[id];
    }

    function exploreDungeon() {
        setStatus('Exploring...');
        alert('Exploring...');
        if (Math.random() > 0.5) {
            initiateNpcEncounter();
        } else {
            alert("Nothing happened this time. Keep exploring!");
        }
    }

    function initiateNpcEncounter() {
        document.getElementById('npc-encounter').classList.remove('hidden');
        document.getElementById('npc-dialogue').innerText = "You encounter a mysterious Planet. What do you do?";
    }

    function npcResponse(responseId) {
        let dialogue;
        switch (responseId) {
            case 1:
                dialogue = "The Civilization gives you a valuable item!";
                break;
            case 2:
                dialogue = "The Civilization shares some useful information.";
                break;
            default:
                dialogue = "The Civilization ignores you.";
        }
        document.getElementById('npc-dialogue').innerText = dialogue;
        setTimeout(() => {
            document.getElementById('npc-encounter').classList.add('hidden');
        }, 3000);
    }

    // Event listeners for navigating between different screens
    document.querySelectorAll('#bottom-bar button').forEach(button => {
        button.addEventListener('click', (event) => {
            const screen = event.target.getAttribute('onclick').replace("navigate('", "").replace("')", "");
            navigate(screen);
        });
    });

    // Initializing the inventory display
    const inventoryDisplay = document.getElementById('inventory-display');
    if (inventoryDisplay) {
        inventoryDisplay.addEventListener('click', (event) => {
            const clickedItem = event.target.closest('.inventory-item');
            if (clickedItem) {
                const itemKey = clickedItem.dataset.item;
                showItemInfo(itemKey);
            }
        });
    }
});

function toggleInventoryScreen(show) {
    const inventoryScreen = document.getElementById('inventory-screen');
    inventoryScreen.style.display = show ? 'block' : 'none';
}

// Example usage:
// Show the inventory screen
toggleInventoryScreen(true);

// Hide the inventory screen
toggleInventoryScreen(false);


