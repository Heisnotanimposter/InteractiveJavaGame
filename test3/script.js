let currentAction = 'Standing';
let character = document.getElementById('character');
let inventory = [];

document.addEventListener('DOMContentLoaded', function() {
  const gameCanvas = document.getElementById('gameCanvas');
  const ctx = gameCanvas.getContext('2d');

  gameCanvas.width = window.innerWidth;
  gameCanvas.height = 300;

  // *** Square ***
  const square = {
    x: 0,
    y: gameCanvas.height / 2 - 25,
    width: 50,
    height: 50,
    speed: 2,
    color: 'blue'
  };

  // *** Circles - Dynamic Generation and Management ***
  const circles = []; // Start with an empty array
  const maxCircles = 5; // Maximum number of circles on screen at once

  function createCircle() {
    return {
      x: Math.random() * (gameCanvas.width - 30),
      y: Math.random() * (gameCanvas.height - 30),
      radius: 15,
      speedX: (Math.random() - 0.5) * 4,  // Random speed and direction
      speedY: (Math.random() - 0.5) * 4,
      color: 'red'
    };
  }

  for (let i = 0; i < maxCircles; i++) {
    circles.push(createCircle());
  }


  // Create initial circles
  for (let i = 0; i < maxCircles; i++) {
    circles.push(createCircle());
  }

    const inventoryItems = {
        redCircle: { 
        name: "Na",
        info: "Sodium is a chemical element with the symbol Na and atomic number 11. It is a soft, silvery-white, highly reactive metal. Sodium is an alkali metal, being in group 1 of the periodic table. Its only stable isotope is 23Na. The free metal does not occur in nature and must be prepared from compounds.",
        collected: 0
    },
    // Add more items as needed
    };

    const inventoryDisplay = document.getElementById('inventory-display');
    function showItemInfo(itemKey) {
        const item = inventoryItems[itemKey];
        if (item.collected > 0) {
            alert(`Item: ${item.name}\nInfo: ${item.info}`);
        }
    }
    // Event listener for clicking on inventory items
    inventoryDisplay.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.inventory-item');
        if (clickedItem) {
            const itemKey = clickedItem.dataset.item;
            showItemInfo(itemKey);
        }
    });

    function updateInventory() {
        const inventoryContainer = document.getElementById('inventory-container');
        inventoryContainer.innerHTML = '';

    for (const itemKey in inventoryItems) {
      const item = inventoryItems[itemKey];
      const inventoryItem = document.createElement('div');
      inventoryItem.classList.add('inventory-item');
      inventoryItem.dataset.item = itemKey; // Store the item key in the data attribute
      inventoryItem.style.backgroundColor = item.color;
      inventoryItem.textContent = `${item.name} x ${item.collected}`; 
      inventoryContainer.appendChild(inventoryItem);
    }
}
      // Animation function
    function animate() {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        // Draw and move the circles
    for (let i = 0; i < circles.length; i++) {  // Use standard for loop for removal
      const circle = circles[i];
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      ctx.fillStyle = circle.color;
      ctx.fill();
      ctx.closePath();

      circle.x += circle.speedX;
      circle.y += circle.speedY;

      // Bounce off edges
      if (circle.x + circle.radius > gameCanvas.width || circle.x - circle.radius < 0) {
        circle.speedX = -circle.speedX;
      }
      if (circle.y + circle.radius > gameCanvas.height || circle.y - circle.radius < 0) {
        circle.speedY = -circle.speedY;
      }

      // Check for collision with the square
      if (isColliding(square, circle)) {
        circles.splice(i, 1); 
        inventoryItems.redCircle.collected++;
        updateInventory();
        i--; // Adjust index after removing an item
      }
    }

    // Create new circles if needed
    while (circles.length < maxCircles) {
      circles.push(createCircle());
    }

    requestAnimationFrame(animate);
  }

  // Start the animation
  animate(); // Call animate() here, not inside the DOMContentLoaded event 
  updateInventory();

    function isColliding(rect, circle) {
        const distX = Math.abs(circle.x - rect.x - rect.width / 2);
        const distY = Math.abs(circle.y - rect.y - rect.height / 2);

        if (distX > (rect.width / 2 + circle.radius)) { return false; }
        if (distY > (rect.height / 2 + circle.radius)) { return false; }

        if (distX <= (rect.width / 2)) { return true; }
        if (distY <= (rect.height / 2)) { return true; }

        const dx = distX - rect.width / 2;
        const dy = distY - rect.height / 2;
        return (dx * dx + dy * dy <= (circle.radius * circle.radius));
    }

    function updateInventory() {
        const inventoryContainer = document.getElementById('inventory-container');
        inventoryContainer.innerHTML = ''; // Clear previous inventory

        inventory.forEach((item, index) => {
            const inventoryItem = document.createElement('div');
            inventoryItem.className = 'inventory-item';
            inventoryItem.style.backgroundColor = item.color;
            inventoryItem.innerText = `Item ${index + 1}`;
            inventoryContainer.appendChild(inventoryItem);
        });
    }

    // Move content into the container
    const contentElements = document.querySelectorAll('.content');
    const contentContainer = document.getElementById('content-container');

    contentElements.forEach(element => {
        contentContainer.appendChild(element);
    });

    // Move pentagons into their container
    const pentagonElements = document.querySelectorAll('.pentagon');
    const pentagonContainer = document.getElementById('pentagon-container');

    pentagonElements.forEach(element => {
        pentagonContainer.appendChild(element);
    });
});

let currentAction = 'Standing';

function moveCharacter(dx, dy) {
    let character = document.getElementById('character');
    let rect = character.getBoundingClientRect();
    let parentRect = character.parentElement.getBoundingClientRect();
    
    let newTop = rect.top + dy;
    let newLeft = rect.left + dx;
    
    // Check boundaries for smooth movement
    if (newTop >= parentRect.top && newTop + rect.height <= parentRect.bottom) {
        character.style.top = newTop - parentRect.top + 'px';
    }
    if (newLeft >= parentRect.left && newLeft + rect.width <= parentRect.right) {
        character.style.left = newLeft - parentRect.left + 'px';
    }
}

function setStatus(action) {
    let statusBar = document.getElementById('status');
    statusBar.innerText = `Status: ${action}`;
    setTimeout(() => statusBar.innerText = 'Status: Standing', 1000);
}

document.addEventListener('keydown', function(event) {
    const key = event.key;
    if (currentAction !== 'Standing') return;

    switch(key) {
        case 'ArrowUp':
            currentAction = 'Moving Up';
            setStatus('Moving Up');
            moveCharacter(0, -10);
            break;
        case 'ArrowDown':
            currentAction = 'Moving Down';
            setStatus('Moving Down');
            moveCharacter(0, 10);
            break;
        case 'ArrowLeft':
            currentAction = 'Moving Left';
            setStatus('Moving Left');
            moveCharacter(-10, 0);
            break;
        case 'ArrowRight':
            currentAction = 'Moving Right';
            setStatus('Moving Right');
            moveCharacter(10, 0);
            break;
    }
});

document.addEventListener('keyup', () => {
    currentAction = 'Standing';
    setStatus('Standing');
});

function collectResources() {
    setStatus('Collecting resources...');
    alert('Resources collected!');

    // Update collected count in the inventory
    for (const circle of circles) {
      if (circle.color === 'red') {
        inventoryItems.redCircle.collected++;
        break; // Collect only one red circle at a time
      }
    }
    updateInventory();

    if (inventoryItems.redCircle.collected >= 2) {  // Assuming you need 2 red circles
        alert("Phase complete! Prepare for the next phase.");
        // ... Add logic to transition to the next phase (e.g., increase difficulty, new enemies)
    }
    // Implement resource collection logic here
  }

// Define skills, thresholds, and player
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
    3: 300,
    // Add more thresholds as needed
};

const player = {
    attackPower: 10,
    hp: 150
};

function manageSkills() {
    setStatus('Managing skills...');
    // Check for level-ups and update skill levels
    for (const skillKey in skills) {
        while (skills[skillKey].experience >= skillExperienceThresholds[skills[skillKey].level]) {
            skills[skillKey].level++;
            alert(`Your ${skills[skillKey].name} skill has reached level ${skills[skillKey].level}!`);
            // Optional bonus for Swordfighting
            if (skillKey === "swordfighting") {
                player.attackPower += 5;
            }
        }
    }

    // Display skills in a more organized way
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

        } // Ensure this part continues where the previous script left off
else if (player.hp <= 0) {
    clearInterval(interval);
    console.log('Player is defeated. Game over.');
    setStatus('Player is defeated. Game over.');
}

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
    // Define adjacency relationships
    const adjacencyMap = {
        1: [2, 4],
        2: [1, 3, 5],
        3: [2, 4],
        4: [1, 3, 5],
        5: [2, 4]
    };
    return adjacencyMap[id];
}

function initiateNpcEncounter() {
    document.getElementById('npc-encounter').classList.remove('hidden');
    document.getElementById('npc-dialogue').innerText = "You encounter a mysterious NPC. What do you do?";
}

function npcResponse(responseId) {
    let dialogue;
    switch (responseId) {
        case 1:
            dialogue = "The NPC gives you a valuable item!";
            break;
        case 2:
            dialogue = "The NPC shares some useful information.";
            break;
        default:
            dialogue = "The NPC ignores you.";
    }
    document.getElementById('npc-dialogue').innerText = dialogue;
    setTimeout(() => {
        document.getElementById('npc-encounter').classList.add('hidden');
    }, 3000);
}



