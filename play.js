import { GameLogic } from "./game/gameLogic.js";
import { UIHandler } from "./uiHandler.js";
import {GameState} from "./game/gameState.js";

const agents = [
    { role: 'mafia', name: 'Vincent', traits: 'charming, persuasive, strategic' },
    { role: 'villager', name: 'David', traits: 'confident, determined, team player' },
    { role: 'villager', name: 'Olivia', traits: 'creative, imaginative, curious' }
];

export async function play(socket) {
    const uiHandler = new UIHandler(socket);
    const gameLogic = new GameLogic(uiHandler);

    gameLogic.initiate(agents);

    await gameLogic.dayConversation();

    while (!gameLogic.isGameOver()) {
        await gameLogic.night();
        if (gameLogic.isGameOver()) break;
        await gameLogic.dayConversation();
        if (gameLogic.isGameOver()) break;
        await gameLogic.vote();
    }
}
