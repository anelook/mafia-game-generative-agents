const socket = io();

socket.on('connect', () => {
    socket.emit('startGame');
});

function createAgentElement(agent) {
    const agentDiv = document.createElement('div');
    agentDiv.className = 'agent';
    agentDiv.id = `agent-${agent.name}`;

    const nameActionContainer = document.createElement('div');
    nameActionContainer.className = 'name-action-container';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.textContent = agent.name;
    nameActionContainer.appendChild(nameDiv);

    const actionDiv = document.createElement('div');
    actionDiv.className = 'action';
    nameActionContainer.appendChild(actionDiv);

    agentDiv.appendChild(nameActionContainer);

    const speechDiv = document.createElement('div');
    speechDiv.className = 'speech';
    const speechContent = document.createElement('div');
    speechContent.className = 'content';
    speechDiv.appendChild(speechContent);
    agentDiv.appendChild(speechDiv);

    const thoughtsDiv = document.createElement('div');
    thoughtsDiv.className = 'thought';
    const thoughtsContent = document.createElement('div');
    thoughtsContent.className = 'content';
    thoughtsDiv.appendChild(thoughtsContent);
    agentDiv.appendChild(thoughtsDiv);
    return agentDiv;
}

socket.on('init', agents => {
    const gameContainer = document.getElementById('container-with-players');
    gameContainer.innerHTML = '';
    agents.forEach(agent => {
        const agentElement = createAgentElement(agent);
        gameContainer.appendChild(agentElement);
    });
});

socket.on('updateSpeech', data => {
    const agentElement = document.getElementById(`agent-${data.name}`);
    console.log("data.text", data.text)
    agentElement.querySelector('.speech .content').textContent = data.text;
});

socket.on('updateThought', data => {
    const agentElement = document.getElementById(`agent-${data.name}`);
    agentElement.querySelector('.thought .content').textContent = data.text;
});

socket.on('updateAction', data => {
    const agentElement = document.getElementById(`agent-${data.name}`);
    agentElement.querySelector('.action').textContent = data.text;
});

socket.on('updateVote', data => {
    const agentElement = document.getElementById(`agent-${data.name}`);
    agentElement.querySelector('.vote .content').textContent = data.vote;
});

socket.on('agentKilled', name => {
    const agentElement = document.getElementById(`agent-${name}`);
    agentElement.classList.add('killed');
});

socket.on('updatePrompt', data => {
    const summary = data.messages.map(message => (`<b>${message.role}</b>:<br /> ${message.content}`)).join('<br /> <br /> <br />')
    const promptsElement = document.getElementById(`prompts`);
    promptsElement.innerHTML = `<b>${data.name}</b>:<br /><br /> ${summary}`;
});

socket.on('gameUpdate', data => {
    const promptsElement = document.getElementById(`game-state`);
    promptsElement.innerHTML = data;
});

socket.on('updateGameState', data => {
    const timeOfDayElement = document.getElementById(`time-of-day`);
    timeOfDayElement.innerHTML = data.timeOfDay;
})

socket.on('updateVillagerState', data => {
    const activeVillagersElement = document.getElementById(`alive-villagers`);
    activeVillagersElement.innerHTML = data.activeVillagers;

    const killedVillagersElement = document.getElementById(`killed-villagers`);
    killedVillagersElement.innerHTML = data.killedVillagers;
})

socket.on('whatIsHappening', whatIsHappening => {
    const whatIsHappeningElement = document.getElementById(`what-is-happening`);
    whatIsHappeningElement.innerHTML = whatIsHappening;
});
