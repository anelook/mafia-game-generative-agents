export class GameState {
    constructor() {
        this.aliveVillagers = [];
        this.killedVillagers = [];
        this.mafia = null;
        this.winner = "";
    }

    cleanState() {
        this.aliveVillagers = [];
        this.killedVillagers = [];
        this.mafia = null;
        this.winner = "";
    }

    addVillager(villager) {
        this.aliveVillagers.push(villager);
    }

    removeVillager(villagerName) {
        const villager = this.aliveVillagers.find(villager => villager.name === villagerName);
        const index = this.aliveVillagers.indexOf(villager);
        if (index > -1) {
            this.aliveVillagers.splice(index, 1);
            this.killedVillagers.push(villager);
        }
    }

    getAliveVillagers() {
        return this.aliveVillagers;
    }


    getActiveVillagers() {
        return this.aliveVillagers; // todo shuffle?
    }

    getKilledVillagers() {
        return this.killedVillagers;
    }

    setMafia(mafia) {
        this.mafia = mafia;
    }

    getMafia() {
        return this.mafia;
    }
}
