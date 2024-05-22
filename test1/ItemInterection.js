function navigate(screen) {
    const screens = document.querySelectorAll('.content');
    screens.forEach(s => s.style.display = 'none');
    document.getElementById(`${screen}-screen`).style.display = 'block';
}

function startBattle() {
    alert('Battle started!');
    // Implement battle logic here
}

function exploreDungeon() {
    alert('Exploring dungeon...');
    // Implement dungeon exploration logic here
    if (Math.random() > 0.5) {
        initiateNpcEncounter();
    } else {
        alert("Nothing happened this time. Keep exploring!");
    }
}

function collectResources() {
    alert('Resources collected!');
    // Implement resource collection logic here
}

function manageSkills() {
    alert('Managing skills...');
    // Implement skill management logic here
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

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('reward-box').style.display = 'none';
});
