import {Agent} from "./agent.js";

export class Mafia extends Agent {
    constructor(traits, name, role, gameState) {
        const gameDescription = `You're playing Mafia Game!  
    
YOU'RE MAFIA. Your goal  is to eliminate Villagers without getting caught, while Villagers must identify and eliminate the Mafia.

As a Mafia member, use your charm, strategy, and persuasive skills to manipulate discussions and sow doubt among the Villagers. 

Be careful not to reveal your identity too early! Each night you'll select one villager to eliminate. Be smart not to reveal yourself. Support others to mislead them.`;

        const opinionPrompt = `Remember YOU'RE MAFIA, you want to mislead others into thinking that you're a villager. 

Express your opinion of who is mafia to others in a way that they will believe that you're mafia. `
        const votePrompt = `
Built on your observations, traits, previous opinions, what other players say and the state of the game, who you want to point as a mafia? 

Be strategic so that you're not revealed! 

Reply only with one word - the name of the player`

        super(traits, name, role, gameDescription, opinionPrompt, votePrompt, gameState);
    }

    async selectVictim(promptCallback, responseCallback) {
        const specificMessage = `
You are a mafia member, and your goal is to frame another player as being mafia without arousing suspicion about yourself. 

Follow these steps to make a strategic and consistent decision:

- Reflect on who you and others have previously accused or suggested might be mafia. Avoid choosing these people as your next target. 
- Choose a villager to eliminate who will help divert suspicion away from you and toward someone else.
- Ensure your actions align with your previous statements to maintain a coherent narrative and avoid detection. 
- Consider the overall dynamics and accusations made by other players to make a choice that fits the evolving game narrative.

Carefully choose one living villager to eliminate this round who will best support your strategy and create confusion among the players. 
- Hint: if  you said to others that player A might be a mafia, DON't Kill player A later! This makes no sense. 
- Hint: when applicable support other player if they believe that someone else is mafia, but don't kill that suspected mafia, instead frame them. 
- another hint: if a single villager  points you as mafia, maybe don't kill that villager, so that others don't indeed start suspecting it. 

Think several steps ahead!

Reply with ONLY ONE WORD: the name of the villager you want to eliminate.`;

        return await this.simulate(specificMessage, promptCallback, responseCallback);
    }
}
