var rolOrder = ["VAMPIRE", "WITCH"];

function createStatus() {
	this.id = '';
	this.logs = [];
	this.turno = '';
	this.currentDeaths = [];
	this.votation = {};
	this.dia = 0;//0 noche , 1 dia
	this.players = {};
	this.played = [];
}

function receivePlay(oldStateJSON, playJSON) //También recibirá el estado de la partida
{
	//Se actualiza la infromación de la partida desde la BD
	var oldState = JSON.parse(oldStateJSON);
	//Get the player, rol, and action of the play and process it
	var play = JSON.parse(playJSON);
	var object = new createStatus();

	object.currentDeaths = oldState.currentDeaths;
	object.dia = oldState.dia;
	object.players = oldState.players;
	object.votation = oldState.votes;
	object.played = oldState.played;

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

	object.acciones = oldState.acciones;
	object.acciones.push(play);

	var newStatus = {
		turno: object.turno,
		dia: object.dia,
		players: object.players,
		acciones: object.acciones,
		currentDeaths: object.currentDeaths,
		votes: object.votation,
		played: object.played
	};

	return Java.to([JSON.stringify(object), JSON.stringify(newStatus)],"java.lang.String[]");
}

function witchMove(play, object) {
	if (play.action != 0) {
		if (play.action == 1) {//Bruja mata
			object.currentDeaths.push(play.victim);
			object.logs.push("The witch slayed Player " + play.victim + " tonight!");
		} else if (play.action == 2) {//Bruja revive
			object.currentDeaths = [];
			object.logs.push("The witch revived Player " + play.victim + " tonight!");
		}
	}
	object.turno = 'WITCH_PLAYED';
	endNight(object); //La bruja acaba la noche    
}

function popularMove(play, object) {
	object.votation[play.victim]++;
	if (object.votation.length == countMaxVotes(object)) {
		resetVotes(object);
		var i = mostVotedPlayer();
		if (i < 0) {
			//Repite Votacion
			object.logs.push("Votation tied and there is no time to vote again...");
		}
		else {
			object.currentDeaths.push(i);
			object.logs.push("The farmers decided to hang Player " + play.victim);
		}
		object.turno = 'POPULAR_VOTED';
		startNight(object);
		object.votation = [];
	}
	else {
		object.logs.push("Player " + play.client + " voted Player " + play.victim + "!");
	}
}

function hunterMove(play, object) {
	object.currentDeaths.push(play.victim);
	object.turno = 'HUNTER_SHOT';
	object.logs.push("Player " + play.client + " has shot Player " + play.victim + "!")
	object.players[play.client] = "DEAD";
	//El cazador muere
	object.currentDeaths.push(play.client);
	if (object.dia) {//Si le ha matado el pueblo, empieza la noche
		startNight(object);
	}
	else {//Si le han matado los vampiros, termina la noche
		endNight(object);
	}

}

function vampireMove(play, object) {
	//Si la victima aun no ha sido votada le ponemos un 1, si ya lo ha sido le sumanos 1
	if(object.votation[play.victim] == null) object.votation[play.victim] = 1;
	else object.votation[play.victim]++;
	object.played[play.client] = 0;
	console.log("CONTANDO LOS VAMPIROS: " + countRol("VAMPIRE",object));
	if (countNumVotes(object) == countRol("VAMPIRE",object)) {
		i = mostVotedPlayer(object);
		if (i == "") {
			object.logs.push("Vampires couldn't decide who to kill!");
		}
		else {
			object.currentDeaths.push(i);
		}
		object.logs.push("Vampires choosed their prey...")
		object.turno = nextRol("VAMPIRE", object);
		playedYourTurn(object);
		object.votation = {};
	}

	else {
		console.log("Entra a continuar la votación");
		object.id = 'CONTINUE_VOTATION';
		//endNight(object);
	}

}

function mostVotedPlayer(object) {
	var name = "";
	var max = 0;
	var draw = 0;

	for (var i in object.votation) {
		if (object.votation[i] > max) {
			name = i;
			max = object.votation[i];
			draw = 0;
		} else if (object.votation[i] == max) {
			draw = 1;
		}
	}

	if (draw == 1) {
		return ""; // Empate
	}

	return name; // Jugador más votado
}

function nextRol(rol, object) {
	var j = 0;
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
			if (countRol(rolOrder[j], object) > 0) {
				return rolOrder[j];
			}
			j++;
		}
		return endNight(object);
	}

}

function endNight(object) {
	processDeaths(object);
	if (object.turno != "HUNTER") {
		object.dia = 1;
		object.turno = "POPULAR_VOTATION";
		object.logs.push("The farmers wake up");
	}
	if(object.turno == "FARMERS_WON" || object.turno == "VAMPIRES_WON"){
		object.gameState = "FINISHED";
		return object.turno;
	}
	return "POPULAR_VOTATION";



}

function startNight(object) {
	processDeaths(object);
	if (object.turno != "HUNTER") {
		object.dia = 0;
		object.logs.push("The farmers go to bed...");
		object.turno = rolOrder[0];
		object.currentDeaths = [];
	}
}

function processDeaths(object) {
	for (var i in object.currentDeaths) {
		if (object.players[object.currentDeaths[i]] == "HUNTER") {//Si el cazador muere, será su turno
			object.logs.push(object.currentDeaths[i] + " was the Hunter, and wants retribution!");
			object.turno = "HUNTER";
			object.currentDeaths.splice(i, 1);
		}
		else {
			object.logs.push((object.currentDeaths[i] + " has died!"));
			//El jugador muere
			object.players[object.currentDeaths[i]] = "DEAD";
		}
	}
	checkWin(object);
}

function checkWin(object)//Comprueba si un bando ha ganado
{
	var vampiresLeft = 0;
	var farmersLeft = 0;
	for (var i in object.players) {
		if (object.players[i] == "VAMPIRE") { vampiresLeft++; }
		else if (object.players[i] != "DEAD") { farmersLeft++; }
	}
	if (vampiresLeft == 0) { object.turno = "FARMERS_WON"; }
	else if (farmersLeft == 0) { object.turno = "VAMPIRES_WON"; }
}

function countNumVotes(object){
	var num = 0;
	for(var i in object.votation){
		num += object.votation[i];
	}
	return num;
}

function countMaxVotes(object) {
	var people = 0;
	for (var i in object.players) {
		if (object.players[i] != "DEAD") {
			people++;
		}
	}
	return people;
}
function countRol(rol, object) {
	var people = 0;
	for (var i in object.players) {
		if (object.players[i] == rol) {
			people++;
		}
	}
	return people;
}

function playedYourTurn(object){
	for(var i in object.players){
		if (object.players[i] == object.newRol
			|| (object.newRol == "POPULAR_VOTATION" && object.players[i] != "DEAD"))
			
				object.played[i] = 1;
	}
}