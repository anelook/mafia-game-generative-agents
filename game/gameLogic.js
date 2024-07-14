import { Mafia } from "../agents/mafia.js";
import { Villager } from "../agents/villager.js";
import { clean, pause, mostFrequentItems } from "../helpers/utils.js";
import {GameState} from "./gameState.js";

export class GameLogic {
    constructor(uiHandler) {
        this.gameState = new GameState();;
        this.uiHandler = uiHandler;
    }

    initiate(agents) {
        this.gameState.cleanState();
        agents.forEach(agent => {
            const villager = agent.role === 'mafia' ? new Mafia(agent.traits, agent.name, agent.role, this.gameState) : new Villager(agent.traits, agent.name, agent.role, this.gameState)

            this.gameState.addVillager(villager);
            if (agent.role === 'mafia') {
                this.gameState.setMafia(villager);
            }
        });
        this.uiHandler.initGameState(this.gameState.getActiveVillagers());
    }

    async dayConversation() {
        const activeVillagers = this.gameState.getActiveVillagers();
        const killedVillagers = this.gameState.getKilledVillagers();

        this.uiHandler.setVillagerState(activeVillagers, killedVillagers);
        this.uiHandler.setGameState("☀️");
        this.uiHandler.setWhatIsHappening("Villagers talk...");

        for (let villager of activeVillagers) {
            await this.handleVillagersConversation(villager, activeVillagers);
        }
    }

    async handleVillagersConversation(villager, activeVillagers) {
        this.uiHandler.updateAction(villager.name, "💬");
        const villagerOpinion = await this.getVillagerOpinion(villager);
        const otherVillagers = activeVillagers.filter(p => p !== villager);

        await this.handleOtherVillagersListening(villager, villagerOpinion, otherVillagers);
        this.resetOtherVillagersState(otherVillagers);

        await pause(1000);
        this.uiHandler.updateSpeech(villager.name, "");
        this.uiHandler.updateAction(villager.name, "");
    }

    createCallbacks(villagerName, updateFunction) {
        let text = '';
        return [
            (messages) => {
                this.uiHandler["updatePrompt"](villagerName, messages);
            },
            (char) => {
                text += char;
                this.uiHandler[updateFunction](villagerName, text);
            }
        ];
    }

    async getVillagerOpinion(villager) {
        const [updatePromptCallback, updateSpeechCallback] = this.createCallbacks(villager.name, 'updateSpeech');
        return await villager.expressOpinion(updatePromptCallback, updateSpeechCallback);
    }

    async handleOtherVillagersListening(villager, villagerOpinion, otherPlayers) {
        for (let otherPlayer of otherPlayers) {
            this.uiHandler.updateAction(otherPlayer.name, "💭");
            await this.getOtherVillagersThoughts(otherPlayer, villager.name, villagerOpinion);
        }
    }

    async getOtherVillagersThoughts(otherVillager, villagerName, villagerOpinion) {
        const [updatePromptCallback, updateThoughtCallback] = this.createCallbacks(otherVillager.name, 'updateThought');
        await otherVillager.listenToOthers(villagerName, villagerOpinion, updatePromptCallback, updateThoughtCallback);
    }

    resetOtherVillagersState(otherVillagers) {
        for (let otherVillager of otherVillagers) {
            this.uiHandler.updateThought(otherVillager.name, "");
            this.uiHandler.updateAction(otherVillager.name, "");
        }
    }

    async night() {
        this.uiHandler.setWhatIsHappening("Villagers are asleep, but mafia is not...");
        this.uiHandler.setGameState("🌌");
        let victimName = await this.gameState.getMafia().selectVictim(() => { }, () => { });
        victimName = victimName.replace(/[^\w\s\']|_/g, "").replace(/\s+/g, " ");
        this.uiHandler.setWhatIsHappening(`Mafia killed ${victimName}`);
        await pause(1000);

        this.gameState.removeVillager(victimName);
        this.uiHandler.agentKilled(victimName);

        if (this.gameState.getActiveVillagers().length < 3) {
            this.gameState.winner = "mafia won";
            return;
        }

        await this.morning(victimName);
    }

    async morning(victimName) {
        const activeVillagers = this.gameState.getActiveVillagers();
        const killedVillagers = this.gameState.getKilledVillagers();
        this.uiHandler.setVillagerState(activeVillagers, killedVillagers);
        this.uiHandler.setGameState("🌅");
        this.uiHandler.setWhatIsHappening(`Villagers learned that mafia killed ${victimName}`);

        for (const villager of this.gameState.getAliveVillagers()) {
            const [updatePromptCallback, updateThoughtCallback] = this.createCallbacks(villager.name, 'updateThought');
            await villager.simulateObservation(1, `During the night ${victimName} was killed by mafia!!! Everyone is shocked!`, updatePromptCallback, updateThoughtCallback);
        }
    }

    async vote() {
        const activeVillagers = this.gameState.getActiveVillagers();
        this.uiHandler.setWhatIsHappening(`Villagers vote who is mafia`);

        const votes = await this.collectVotes(activeVillagers);
        const voteResult = mostFrequentItems(votes);

        if (voteResult.length !== 1) {
            await this.handleNoAgreement(activeVillagers, votes);
            return;
        }

        await this.processVoteResult(voteResult[0], activeVillagers);
    }

    async collectVotes(villagers) {
        const result = [];
        for (let villager of villagers) {
            let suspectedMafia = await villager.vote();
            suspectedMafia = clean(suspectedMafia);
            result.push(suspectedMafia);
        }
        return result;
    }

    async handleNoAgreement(villagers, votes) {
        this.uiHandler.setWhatIsHappening(`No common agreement, voteResult: ${votes.join(', ')}`);
        for (let villager of villagers) {
            const [updatePromptCallback, updateThoughtCallback] = this.createCallbacks(villager.name, 'updateThought');
            await villager.simulateObservation(1, `No common agreement, let's try again!`, updatePromptCallback, updateThoughtCallback);
        }
    }

    async processVoteResult(villagerNameToBeKickedOut, activeVillagers) {
        if (villagerNameToBeKickedOut === this.gameState.mafia.name) {
            this.uiHandler.setWhatIsHappening(`Villagers found mafia: ${this.gameState.mafia.name}`);
            this.gameState.winner = "villagers";
            return;
        }

        this.gameState.removeVillager(villagerNameToBeKickedOut);
        this.uiHandler.setWhatIsHappening(`Villagers made a mistake: ${this.gameState.mafia.name} is not mafia`);
        await this.handleWrongVote(activeVillagers, villagerNameToBeKickedOut);
    }

    async handleWrongVote(villagers, villagerNameToBeKickedOut) {
        for (let villager of villagers) {
            const [updatePromptCallback, updateThoughtCallback] = this.createCallbacks(villager.name, 'updateThought');
            await villager.simulateObservation(1, `We decided to eliminate ${villagerNameToBeKickedOut}, but we were wrong, it's not mafia, we lost an honest villager!`, updatePromptCallback, updateThoughtCallback);
        }
    }

    isGameOver() {
        const isGameOver = this.gameState.winner.length > 0;
        if (isGameOver) {
            this.uiHandler.setGameState(`GAME OVER: ${this.gameState.winner}`);
        }
        return this.gameState.winner.length > 0;
    }
}
