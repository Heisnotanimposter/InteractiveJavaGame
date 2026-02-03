export class EventManager {
    constructor(playerStats, missionSystem) {
        this.playerStats = playerStats;
        this.missionSystem = missionSystem;
        this.modal = document.createElement('div');
        this.modal.id = 'event-modal';
        this.modal.style.position = 'absolute';
        this.modal.style.top = '50%';
        this.modal.style.left = '50%';
        this.modal.style.transform = 'translate(-50%, -50%)';
        this.modal.style.backgroundColor = 'rgba(0, 20, 40, 0.95)';
        this.modal.style.border = '2px solid #00aaff';
        this.modal.style.padding = '20px';
        this.modal.style.color = '#fff';
        this.modal.style.minWidth = '500px';
        this.modal.style.maxWidth = '600px';
        this.modal.style.display = 'none';
        this.modal.style.zIndex = '100';
        this.modal.style.fontFamily = 'Courier New, monospace';
        document.body.appendChild(this.modal);

        this.isOpen = false;
    }

    triggerAnomaly(position) {
        if (this.isOpen) return;
        this.isOpen = true;
        this.modal.style.display = 'block';

        const events = [
            {
                title: "Ancient Signal",
                desc: "You intercept a signal from a long-dead civilization. It contains encrypted data.",
                choices: [
                    {
                        text: "Decrypt the signal",
                        effect: () => {
                            this.playerStats.addExperience(50);
                            this.playerStats.addCredits(200);
                            return "You successfully decrypt the signal! It reveals coordinates to a hidden cache. +50 XP, +200₵";
                        }
                    },
                    {
                        text: "Ignore it",
                        effect: () => {
                            return "You leave the signal behind. Nothing happens.";
                        }
                    },
                    {
                        text: "Report to authorities",
                        effect: () => {
                            this.playerStats.modifyReputation('FRIENDLY', 10);
                            this.playerStats.addCredits(100);
                            return "The authorities reward you for your discovery. +10 FRIENDLY reputation, +100₵";
                        }
                    }
                ]
            },
            {
                title: "Space Debris Field",
                desc: "You encounter a field of wreckage from an old battle. Valuable materials float among the debris.",
                choices: [
                    {
                        text: "Salvage materials",
                        effect: () => {
                            if (this.playerStats.canCarryMore(5)) {
                                this.playerStats.addResource('scrap', 5);
                                this.playerStats.addResource('metals', 3);
                                this.playerStats.addExperience(25);
                                return "You collect valuable scrap and metals. +5 scrap, +3 metals, +25 XP";
                            } else {
                                return "Your cargo hold is full! You can't carry more.";
                            }
                        }
                    },
                    {
                        text: "Search for survivors",
                        effect: () => {
                            if (Math.random() > 0.5) {
                                this.playerStats.addCredits(150);
                                this.playerStats.modifyReputation('FRIENDLY', 5);
                                return "You find a survivor and rescue them! +150₵, +5 FRIENDLY reputation";
                            } else {
                                return "No survivors found. The wreckage is old and cold.";
                            }
                        }
                    },
                    {
                        text: "Leave it",
                        effect: () => {
                            return "You continue on your journey.";
                        }
                    }
                ]
            },
            {
                title: "Quantum Fluctuation",
                desc: "Your ship's sensors detect a strange quantum anomaly. Reality seems to warp around you.",
                choices: [
                    {
                        text: "Investigate closely",
                        effect: () => {
                            if (Math.random() > 0.3) {
                                this.playerStats.addExperience(75);
                                this.playerStats.addResource('crystals', 2);
                                return "You discover rare quantum crystals! +75 XP, +2 crystals";
                            } else {
                                this.playerStats.addExperience(30);
                                return "The anomaly fades before you can study it fully. +30 XP";
                            }
                        }
                    },
                    {
                        text: "Avoid it",
                        effect: () => {
                            return "You steer clear of the anomaly. Better safe than sorry.";
                        }
                    },
                    {
                        text: "Scan from distance",
                        effect: () => {
                            this.playerStats.addExperience(40);
                            this.playerStats.addCredits(80);
                            return "Your scans reveal valuable data you can sell. +40 XP, +80₵";
                        }
                    }
                ]
            },
            {
                title: "Derelict Ship",
                desc: "An abandoned ship drifts through space. Its hull shows signs of battle damage.",
                choices: [
                    {
                        text: "Board the ship",
                        effect: () => {
                            if (Math.random() > 0.4) {
                                const credits = 100 + Math.random() * 200;
                                this.playerStats.addCredits(credits);
                                this.playerStats.addResource('scrap', 3);
                                this.playerStats.addExperience(60);
                                return `You find valuable cargo and scrap! +${Math.floor(credits)}₵, +3 scrap, +60 XP`;
                            } else {
                                this.playerStats.addExperience(20);
                                return "The ship is picked clean. Nothing of value remains. +20 XP";
                            }
                        }
                    },
                    {
                        text: "Report its location",
                        effect: () => {
                            this.playerStats.modifyReputation('FRIENDLY', 8);
                            this.playerStats.addCredits(120);
                            return "Authorities reward you for the information. +8 FRIENDLY reputation, +120₵";
                        }
                    },
                    {
                        text: "Leave it alone",
                        effect: () => {
                            return "You respect the dead and move on.";
                        }
                    }
                ]
            },
            {
                title: "Pirate Encounter",
                desc: "Hostile ships approach! They're demanding your cargo.",
                choices: [
                    {
                        text: "Fight them",
                        effect: () => {
                            if (this.playerStats.shipStats.weaponDamage > 0 || Math.random() > 0.6) {
                                this.playerStats.addCredits(300);
                                this.playerStats.addExperience(100);
                                this.playerStats.modifyReputation('HOSTILE', -5);
                                return "You defeat the pirates! +300₵, +100 XP, -5 HOSTILE reputation";
                            } else {
                                const lostCredits = Math.floor(this.playerStats.credits * 0.3);
                                this.playerStats.spendCredits(lostCredits);
                                return `You're outgunned! You pay ${lostCredits}₵ to escape.`;
                            }
                        }
                    },
                    {
                        text: "Pay the ransom",
                        effect: () => {
                            const ransom = Math.min(200, this.playerStats.credits);
                            this.playerStats.spendCredits(ransom);
                            return `You pay ${ransom}₵ to the pirates and they let you go.`;
                        }
                    },
                    {
                        text: "Try to escape",
                        effect: () => {
                            if (Math.random() > 0.4) {
                                this.playerStats.addExperience(30);
                                return "You successfully escape! +30 XP";
                            } else {
                                const lostCredits = Math.floor(this.playerStats.credits * 0.2);
                                this.playerStats.spendCredits(lostCredits);
                                return `They catch up and take ${lostCredits}₵ before you escape.`;
                            }
                        }
                    }
                ]
            }
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        this.displayEvent(event);
    }
    
    displayEvent(event) {
        let html = `
            <h2 style="margin-top: 0; color: #00aaff;">${event.title}</h2>
            <p style="margin-bottom: 20px;">${event.desc}</p>
            <div id="event-choices" style="display: flex; flex-direction: column; gap: 10px;">
        `;
        
        event.choices.forEach((choice, index) => {
            html += `
                <button class="event-choice" data-index="${index}" style="background:#004466; border:1px solid #00aaff; padding:10px; color:#fff; cursor:pointer; text-align:left;">
                    ${choice.text}
                </button>
            `;
        });
        
        html += `</div><div id="event-result" style="margin-top: 15px; padding: 10px; background: rgba(0, 50, 100, 0.3); display: none;"></div>`;
        
        this.modal.innerHTML = html;
        
        this.modal.querySelectorAll('.event-choice').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const choice = event.choices[index];
                const result = choice.effect();
                
                // Hide choices and show result
                document.getElementById('event-choices').style.display = 'none';
                const resultDiv = document.getElementById('event-result');
                resultDiv.style.display = 'block';
                resultDiv.innerText = result;
                resultDiv.style.color = '#00ff00';
                
                // Add close button
                setTimeout(() => {
                    const closeBtn = document.createElement('button');
                    closeBtn.innerText = 'Continue';
                    closeBtn.style.cssText = 'background:#00aaff; border:none; padding:10px 20px; color:white; cursor:pointer; margin-top: 10px;';
                    closeBtn.addEventListener('click', () => this.close());
                    resultDiv.appendChild(closeBtn);
                }, 500);
            });
        });
    }

    close() {
        this.isOpen = false;
        this.modal.style.display = 'none';
    }
}
