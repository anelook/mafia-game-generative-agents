import {Agent} from "./agent.js";

export class Villager extends Agent {
    constructor(traits, name, role, gameState) {
        const gameDescription = ` You're playing Mafia Game. 
You're A VILLAGER. The goal for mafia members is to eliminate villagers without getting caught, while villagers must identify and eliminate the mafia. 

Rely on your observations, analytical skills, and teamwork to uncover the mafia.`;
            const opinionPrompt = `Built on your observations, traits, previous opinions, what other players say and the state of the game, express your opinion to other players on who the mafia can be. 
    
Pay attention to what other players said and who is not consistent with their expressions.`;
            const votePrompt = `Built on your observations, traits, previous opinions, what other players say and the state of the game, Who do you think is the mafia? 
        
Reply only with one word - the name of the player`
        super(traits, name, role, gameDescription, opinionPrompt, votePrompt, gameState);
    }
}
