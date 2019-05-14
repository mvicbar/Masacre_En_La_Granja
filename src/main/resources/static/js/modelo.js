//Informacion de la partida
dia = 0;//0 noche , 1 dia
players = [];
/*players[0] = "VAMPIRE";
players[1] = "HUNTER";
players[2] = "WITCH";
players[3] = "FARMER";
players[4] = "FARMER";
players[5] = "VAMPIRE";
players[6] = "FARMER";
players[7] = "FARMER";*/
rolOrder = [];
rolOrder[0] = "VAMPIRE";
rolOrder[1] = "WITCH";
currentDeaths = [];
votation = [];
votes = [];

function statusUpdate() {
	this.id = '';
	this.deaths = [];
	this.logs = [];
	this.newRol = '';
}
/*Para consultar
playJSON = {
    rol: 'VAMPIRE',
    client: client,
    victim: victim_,
}
*/

function recivePlay(oldStateJSON, playJSON)//Tambien recibirá el estado de la partida
{
	//Se hactualiza la infromación de la partida desde la BD
	var oldState = JSON.parse(oldStateJSON);
	currentDeaths = oldState.currentDeaths;
	dia = oldState.dia;
	players = oldState.players;
	votation = oldState.votes;
	console.log(players);
	//Get the player, rol, and action of the play and process it
	var play = JSON.parse(playJSON);
	object = new statusUpdate();
	switch (play.rol) {
		case 'VAMPIRE':
			vampireMove(play, object); //Se le envía el nuevo estado al servidor
			break;
		case 'HUNTER':
			hunterMove(play, object);
			break;
		case 'POPULAR_VOTE':
			popularMove(play, object);
			break;
		case 'WITCH':
			witchMove(play, object);
			break;
	}
	object.deaths = currentDeaths;
	acciones = oldState.acciones;
	acciones.push(jugada);
	
	var newStatus = {
		momento: object.id,
		dia: dia,
		players: players,
		acciones: acciones,
		currentDeaths: currentDeaths,
		votes: votation
	};

	return [JSON.stringify(object), JSON.stringify(newStatus)];
}

function witchMove(play, object) {
	if (play.action != 0) {
		if (play.action == 1) {//Bruja mata
			currentDeaths.push(play.victim);
			object.logs.push("The witch slayed Player " + (play.victim + 1) + " tonight!");
		} else if (play.action == 2) {//Bruja revive
			currentDeaths = [];
			object.logs.push("The witch revived Player " + (play.victim + 1) + " tonight!");
		}
	}
	object.id = 'WITCH_PLAYED';
	endNight(object); //La bruja acaba la noche    
}

function popularMove(play, object) {
	votation.push(play.victim);
	if (votation.length == countMaxVotes()) {
		resetVotes();
		i = evenRepeatVotationCount();
		if (i < 0) {
			//Repite Votacion
			object.logs.push("Votation tied and there is no time to vote again...");
			object.id = 'POPULAR_VOTED';
			startNight(object);
		}
		else {
			currentDeaths.push(i);
			object.logs.push("The farmers decided hang Player " + (play.victim + 1));
			object.id = 'POPULAR_VOTED';
			startNight(object);
		}
		votation = [];
	}
	else {
		object.id = 'CONTINUE_VOTATION';
		object.logs.push("Player " + (play.client + 1) + " voted Player " + (play.victim + 1) + "!");
	}
}

function hunterMove(play, object) {
	currentDeaths.push(play.victim);
	object.id = 'HUNTER_SHOT';
	object.logs.push("Player " + (play.client + 1) + " has shot Player " + (play.victim + 1) + "!")
	players[play.client] = "DEAD";
	//El cazador muere
	currentDeaths.push(play.client);
	if (dia) {//Si le ha matado el pueblo, empieza la noche
		startNight(object);
	}
	else {//Si le han matado los vampiros, termina la noche
		endNight(object);
	}

}

function votationLength() {
	var voteCont = 0;
	for (i in votation) {
		voteCont += votation[i];
	}
	return voteCont;
}

function vampireMove(play, object) {
	votation.push(play.victim);
	if (votationLength() == countRol("VAMPIRE")) {
		resetVotes();
		i = evenRepeatVotationCount();
		if (i == "") {
			//Repite Votacion
			object.logs.push("Vampires couldn't decide who to kill!");
			object.id = 'VAMPIRES_VOTED';
		}
		else {
			currentDeaths.push(i);
			object.id = 'VAMPIRES_VOTED';
		}
		object.newRol = nextRol("VAMPIRE", object);
		votation = [];
	}
	else { 
		object.id = 'CONTINUE_VOTATION';
	}
}

function evenRepeatVotationCount() {
	greatest = "";
	greatestVotes = -1;
	greatestEven = -1;

	for(i in votation){
		if(votation[i] > greatestVotes){
			greatest = i;
			greatestVotes = votation[i];
		}else if(votation[i] == greatestVotes){
			greatestEven = greatestVotes;
		}
	}
	if (greatestVotes == greatestEven) {
		return "";//Empate al mejor, se repite votacion
	}
	return greatest;//Mayoría
}

function nextRol(rol, object) {
	j = 0;
	while (j < rolOrder.length) {
		if (rol == rolOrder[j]) {
			break;
		}
		j++;
	}
	if (j >= rolOrder.length - 1) {
		return endNight(object);
	}
	else {
		j++;
		while (j < rolOrder.length) {
			if (countRol(rolOrder[j]) > 0) {
				return rolOrder[j];
			}
			j++;
		}
		return endNight(object);
	}

}

function endNight(object) {
	processDeaths(object);
	if (object.newRol != "HUNTER") {
		dia = 1;
		object.newRol = "POPULAR_VOTATION";
		object.logs.push("The farmers wake up");
	}
	return "POPULAR_VOTATION";



}

function startNight(object) {
	processDeaths(object);
	if (object.newRol != "HUNTER") {
		dia = 0;
		object.logs.push("The farmers go to bed...");
		object.newRol = rolOrder[0];
	}
}

function processDeaths(object) {
	for(i in currentDeaths){
		if (players[currentDeaths[i]] == "HUNTER") {//Si el cazador muere, será su turno
			object.logs.push(currentDeaths[i] + " was the Hunter, and wants retribution!");
			object.newRol = "HUNTER";
			currentDeaths.splice(i, 1);
		}
		else {
			object.logs.push((currentDeaths[i] + " has died!");
			//El jugador muere
			players[currentDeaths[i]] = "DEAD";
		}
	}
	checkWin(object);
}

function checkWin(object)//Comprueba si un bando ha ganado
{
	vampiresLeft = 0;
	farmersLeft = 0;
	for (i in players) {
		if (players[i] == "VAMPIRE") { vampiresLeft++; }
		else if (players[i] != "DEAD") { farmersLeft++; }
	}
	if (vampiresLeft == 0) { object.id = "FARMERS_WON"; }
	else if (farmersLeft == 0) { object.id = "VAMPIRES_WON"; }
}

function countMaxVotes() {
	people = 0;
	for (i in players) {
		if (players[i] != "DEAD") {
			people++;
		}
	}
	return people;
}
function countRol(rol) {
	people = 0;
	for (i in players) {
		if (players[i] == rol) {
			people++;
		}
	}
	return people;
}

function resetVotes() {
	for (i = 0; i < players.length; i++) {
		votes[i] = 0;
	}
}