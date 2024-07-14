import {getStream} from "../helpers/utils.js";

export class Agent {
    constructor(traits, name, role, gameDescription, opinionPrompt, votePrompt, gameState) {
        // general information
        this.name = name;
        this.traits = traits;
        this.gameDescription = gameDescription;
        this.role = role;

        // state
        this.isAlive = true;
        this.observations = [];
        this.opinions = [];
        this.whatYouHeard = [];

        // prompts
        this.opinionPrompt = opinionPrompt;
        this.votePrompt = votePrompt;

        // shared game state object
        this.gameState = gameState;
    }

    async simulate(message, promptCallback, responseCallback) {
        const lastObservations = this.observations.join(', ');
        const lastOpinions = this.opinions.join(", ");
        const whatYouHeard = this.whatYouHeard.join(", ");

        const latestState = lastObservations.length > 0 || lastOpinions.length > 0 ? `- Your recent observation: ${lastObservations}.
- What you said recently to others: 
${lastOpinions}. 
- What you heard from others (they might be lying!):  
${whatYouHeard}` :
`This is the very start of the conversation, you don't know anything yet.  Start a conversation with others. Try to convince them that you're not mafia. Be polite. Share only your message, no additional text. `;

        const messages = [
            {
                role: "system",
                content: `${this.gameDescription}. 
You are ${this.name}, you're ${this.traits}. 
                
Current state of the game: 
                
- alive players: ${this.gameState.getActiveVillagers().map(villager => villager.name)}
- killed villagers: ${this.gameState.getKilledVillagers().map(villager => villager.name)}`
            },
            {
                role: "user",
                content:
                    `${latestState}.
${message}. 
Be very concise, Say one sentence. Share only your message, no additional text. `
            }
        ];

        if (promptCallback) {
            promptCallback(messages);
        }

        return await getStream(messages, responseCallback);
    }

    async expressOpinion(promptCallback, responseCallback) {
        const specificMessage = this.opinionPrompt;

        const opinion = await this.simulate(specificMessage, promptCallback, responseCallback);
        this.opinions.push(opinion);
        return opinion;
    }

    async listenToOthers(playerName, whatYouHeard, promptCallback, responseCallback) {
        this.whatYouHeard.push(`${playerName}: ${whatYouHeard}`);

        const opinion = await this.simulate(`You heard the player ${playerName} said "${whatYouHeard}". How this affects your next steps in the game? remember you're ${this.role} and your name is ${this.name}. `, promptCallback, responseCallback);

        this.opinions.push(opinion)
    }

    async simulateObservation(villager, observation, promptCallback, responseCallback) {
        this.observations.push(await this.simulate(observation, promptCallback, responseCallback))
    }

    async vote() {
        return await this.simulate(this.votePrompt, "votes");
    }
}
