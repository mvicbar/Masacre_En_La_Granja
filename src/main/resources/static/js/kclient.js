function addNewPlayerToLobby(name) {
	const miembros = document.getElementsByClassName("miembros");
	miembros[0].innerHTML = miembros[0].innerHTML + "<td>" + name + "</td>";
}

const handleNewPlayer = (name) => {
	addNewPlayerToLobby(name);
}

const handleMessage = (o) => {
	console.log(o);
	if (o.newPlayer) handleNewPlayer(o.newPlayer);
}

window.addEventListener('load', () => {
	if (config.socketUrl !== false) {
		ws.initialize(config.socketUrl);
	}
	ws.receive = (text) => {
		console.log("just in:", text);
		try {
			const o = JSON.parse(text);
			handleMessage(o);
		} catch (e) {
			console.log("...not json: ", e);
		}
	}
	window.setInterval(() => { }, 5000);
});
