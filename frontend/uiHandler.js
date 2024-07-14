export class UIHandler {
    constructor(socket) {
        this.socket = socket;
    }

    setGameState(timeOfDay) {
        this.socket.emit('updateGameState', {
            timeOfDay
        });
    }

    setVillagerState(activeVillagers, killedVillagers) {
        this.socket.emit('updateVillagerState', {
            activeVillagers:  activeVillagers.map(villager => villager.name).join(', '),
            killedVillagers: killedVillagers.map(villager => villager.name).join(', ')
        });
    }

    setWhatIsHappening(whatIsHappening) {
        this.socket.emit('whatIsHappening', whatIsHappening);
    }

    updateAction(name, text) {
        this.socket.emit('updateAction', { name, text });
    }

    updateSpeech(name, text) {
        this.socket.emit('updateSpeech', { name, text });
    }

    updatePrompt(name, messages) {
        this.socket.emit('updatePrompt', { name, messages });
    }

    updateThought(name, text) {
        this.socket.emit('updateThought', { name, text });
    }

    agentKilled(name) {
        this.socket.emit('agentKilled', { name });
    }

    initGameState(players) {
        this.socket.emit('init', players.map(villager => ({ name: villager.name, isAlive: villager.isAlive })));
    }
}
