export class TradeMenu {
    constructor() {
        this.visible = false;
        this.station = null;
        this.playerStats = null;
        
        this.createUI();
    }
    
    createUI() {
        this.modal = document.createElement('div');
        this.modal.id = 'trade-modal';
        this.modal.style.position = 'absolute';
        this.modal.style.top = '50%';
        this.modal.style.left = '50%';
        this.modal.style.transform = 'translate(-50%, -50%)';
        this.modal.style.backgroundColor = 'rgba(0, 20, 40, 0.95)';
        this.modal.style.border = '2px solid #00aaff';
        this.modal.style.padding = '20px';
        this.modal.style.color = '#fff';
        this.modal.style.minWidth = '500px';
        this.modal.style.maxHeight = '80vh';
        this.modal.style.overflowY = 'auto';
        this.modal.style.display = 'none';
        this.modal.style.zIndex = '100';
        this.modal.style.fontFamily = 'Courier New, monospace';
        document.body.appendChild(this.modal);
    }
    
    open(station, playerStats) {
        this.station = station;
        this.playerStats = playerStats;
        this.visible = true;
        this.modal.style.display = 'block';
        this.updateDisplay();
    }
    
    close() {
        this.visible = false;
        this.modal.style.display = 'none';
        this.station = null;
    }
    
    updateDisplay() {
        if (!this.station || !this.playerStats) return;
        
        const goods = this.station.tradeGoods;
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #00aaff;">Trade Station - ${this.station.faction}</h2>
                <button id="trade-close" style="background:#ff3300; border:none; padding:8px 15px; color:white; cursor:pointer; font-size:14px;">Close</button>
            </div>
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(0, 50, 100, 0.3); border: 1px solid #00aaff;">
                <div>Credits: <span style="color: #00ff00;">${Math.floor(this.playerStats.credits)}</span></div>
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
                        <button class="trade-buy" data-item="${item}" style="background:#00aa00; border:none; padding:5px 10px; color:white; cursor:pointer; margin-right:5px; font-size:12px;">Buy</button>
                        <button class="trade-sell" data-item="${item}" style="background:#aa0000; border:none; padding:5px 10px; color:white; cursor:pointer; font-size:12px;">Sell</button>
                    </td>
                </tr>
            `;
        }
        
        html += `
                </tbody>
            </table>
        `;
        
        this.modal.innerHTML = html;
        
        // Event listeners
        document.getElementById('trade-close').addEventListener('click', () => this.close());
        
        this.modal.querySelectorAll('.trade-buy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.dataset.item;
                this.buyItem(item);
            });
        });
        
        this.modal.querySelectorAll('.trade-sell').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.dataset.item;
                this.sellItem(item);
            });
        });
    }
    
    buyItem(item) {
        if (!this.station || !this.playerStats) return;
        
        const prices = this.station.tradeGoods[item];
        if (!prices) return;
        
        if (!this.playerStats.canCarryMore(1)) {
            alert('Cargo full!');
            return;
        }
        
        if (this.playerStats.spendCredits(prices.buy)) {
            this.playerStats.addResource(item, 1);
            this.updateDisplay();
        } else {
            alert('Not enough credits!');
        }
    }
    
    sellItem(item) {
        if (!this.station || !this.playerStats) return;
        
        const prices = this.station.tradeGoods[item];
        if (!prices) return;
        
        if (this.playerStats.removeResource(item, 1)) {
            this.playerStats.addCredits(prices.sell);
            this.updateDisplay();
        } else {
            alert(`No ${item} to sell!`);
        }
    }
}

