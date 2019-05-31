var rolOrder = ["VAMPIRO", "BRUJA"];
var cosasQuePasan = "";

function createStatus() {
	this.logs = [];
	this.turno = '';
	this.currentDeaths = [];
	this.votation = {};
	this.dia = 0;//0 noche , 1 dia
	this.players = {};
	this.oldRols = {};
	this.played = [];
	this.gameState = "";
	this.availableWitchActions = 0; //0 = Ninguna, 1 = matar, 2 = revivir, 3 = ambas
}

function receivePlay(oldStateJSON, playJSON) //También recibirá el estado de la partida
{
	//Se actualiza la infromación de la partida desde la BD
	var oldState = JSON.parse(oldStateJSON);
	//Get the player, rol, and action of the play and process it
	var play = JSON.parse(playJSON);
	var object = new createStatus();

	object.currentDeaths = [];
	object.dia = oldState.dia;
	object.players = oldState.players;
	object.votation = oldState.votes;
	object.played = oldState.played;
	object.gameState = oldState.gameState;
	object.turno = oldState.turno;
	object.oldRols = oldState.oldRols;
	object.availableWitchActions = oldState.availableWitchActions;

	switch (play.rol) {
		case 'VAMPIRO':
			vampireMove(play, object); //Se le envía el nuevo estado al servidor
			break;
		case 'CAZAVAMPIROS':
			hunterMove(play, object);
			break;
		case 'POPULAR_VOTE':
			object.turno = oldState.turno;
			popularMove(play, object);
			break;
		case 'BRUJA':
			witchMove(play, object);
			break;
	}

	object.acciones = oldState.acciones;
	object.acciones.push(play);

	var newStatus = {
		gameState: object.gameState,
		turno: object.turno,
		dia: object.dia,
		players: object.players,
		oldRols: object.oldRols,
		acciones: object.acciones,
		currentDeaths: object.currentDeaths,
		votes: object.votation,
		played: object.played,
		availableWitchActions: object.availableWitchActions
	};

	return Java.to([JSON.stringify(object), JSON.stringify(newStatus), JSON.stringify(cosasQuePasan)], "java.lang.String[]");
}

// option 0 -> no hace nada
// option 1 -> mata al objetivo
// option 2 -> protege al jugador víctima de los vampiros
function witchMove(play, object) {

	if (play.option == 1 && (object.availableWitchActions == 1 || object.availableWitchActions == 3)) {// La bruja mata
		var victimaCorrecta = 0;
		if (object.currentDeaths.length > 0) {
			if (play.victim != object.currentDeaths[0]) {
				victimaCorrecta = 1;
			}
		} else {
			victimaCorrecta = 1;
		}
		if (victimaCorrecta == 1) {
			object.availableWitchActions = object.availableWitchActions == 3 ? 2 : 0;
			object.currentDeaths.push(play.victim);
			object.logs.push("¡La bruja ha sacrificado en inefable ritual a su primogénito y ha obligado a " + play.victim + " a apuñalar su propio corazón! ¡Temed el poder del Ominoso!");
		}
	}
	else if (play.option == 2 && (object.availableWitchActions == 2 || object.availableWitchActions == 3)) { // La bruja protege
		object.availableWitchActions = object.availableWitchActions == 3 ? 1 : 0;
		object.currentDeaths = []; //ojo que si mata y luego revive... revive a los dos....
		object.logs.push("La bruja ha quemado los huesos de sus ancestros para implorar a su dios pagano y ha protegido el alma de " + play.victim + ". ¡Alabad todos al Ominoso!");
	}
	//Sin else para que si gasta sus opciones tambien haga end nigth
	if (play.option == 0 || object.availableWitchActions == 0) { // La bruja no hace nada
		endNight(object);
	}

}

function popularMove(play, object) {
	//Si la victima aun no ha sido votada le ponemos un 1, si ya lo ha sido le sumanos 1
	if (object.votation[play.victim] == null) object.votation[play.victim] = 1;
	else object.votation[play.victim]++;
	object.played[play.client] = 0;
	if (countNumVotes(object) == countMaxVotes(object)) {
		var i = mostVotedPlayer(object);
		if (i == "") {
			object.logs.push("El pueblo se ha pasado todo el día discutiendo sin sacar nada en claro. Habéis perdido el tiempo y lo pagaréis con vuestras vidas.");
		}
		else {
			object.currentDeaths.push(i);
			object.logs.push("El pueblo ha decidido estacar y decapitar a " + i + ".");
		}
		
		startNight(object);
		if(object.turno !== "CAZAVAMPIROS" && object.turno !== "VAMPIRES_WON" && object.turno !== "FARMERS_WON" && object.turno !== "TIE") {
            object.turno = "VAMPIRO";
        }
		playedNextTurn(object);
		object.votation = {};
	}
	else {
		object.logs.push(play.client + " piensa que hay que decapitar a" + play.victim + ".");
	}

}

function hunterMove(play, object) {
    //La víctima muere
	object.currentDeaths.push(play.victim);
	object.turno = 'HUNTER_SHOT';
  
	object.played[play.client] = 0;
	object.logs.push(play.client + ", el cazavampiros, hace acopio de sus últimas fuerzas y antes " +
		"de expirar, vacía el cargador de su winchester sobre " + play.victim);

    //El cazador muere
	object.players[play.client] = "DEAD";
	object.currentDeaths.push(play.client);
    object.turno = nextRol("CAZAVAMPIROS", object);
    playedNextTurn(object);
    object.votation = {};

	if (object.dia) {//Si le ha matado el pueblo, empieza la noche
		startNight(object);
	}
	else {//Si le han matado los vampiros, termina la noche
		endNight(object);
	}

}

function vampireMove(play, object) {
	//Si la victima aun no ha sido votada le ponemos un 1, si ya lo ha sido le sumanos 1
	if (object.votation[play.victim] == null) object.votation[play.victim] = 1;
	else object.votation[play.victim]++;
	object.played[play.client] = 0;
	if (countNumVotes(object) == countRol("VAMPIRO", object)) {
		var i = mostVotedPlayer(object);
		if (i == "") {
			object.logs.push("Los vampiros no logran acordar a quién se cenarán y el sol está a " +
				"punto de alzarse. Parece que les tocará ayunar.");
		}
		else {
			object.currentDeaths.push(i);
		}
		object.logs.push(play.victim + ", puedes huir, pero no esconderte. Oyes los gruñidos de " +
			"los vampiros cada vez más y más cerca mientras corres. No aguantarás mucho más así. " +
			"¿Últimas palabras?");
		object.turno = nextRol("VAMPIRO", object);
		playedNextTurn(object);
		object.votation = {};
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
	}//j rol por el que vamos
	if (j >= rolOrder.length - 1) {
		return endNight(object);
	}//si es el ultimo entonces end night
	else {
		j++;
		while (j < rolOrder.length) {
			if (countRol(rolOrder[j], object) > 0) {
				// si la bruja ya no puede jugar mas nos la saltamos
				if(rolOrder[j] == "BRUJA" && object.availableWitchActions == 0){
					j++;
					continue;
				}
				return rolOrder[j];
			}
			j++;
		}//siguiente rol o si no end night
		return endNight(object);
	}

}

function endNight(object) {
	processDeaths(object);

	if (object.turno == "FARMERS_WON" || object.turno == "VAMPIRES_WON" || object.turno == "TIE") {
		return object.turno;
	}

	if (object.turno != "CAZAVAMPIROS") {
		object.dia = 1;
		object.turno = "POPULAR_VOTATION";
		for(var i in object.players){
			if(object.players[i] != "DEAD"){
				object.played[i] = 1;
			}
		}
		object.logs.push("Los primeros rayos de sol asoman en el horizonte y los habitantes del " +
			"pueblo se levantan un día más para seguir adelante con sus miserables " +
			"vidas. Elegid sabiamente a quién decapitaréis, o puede que sea el último...");
	}
    else return "CAZAVAMPIROS";

	return "POPULAR_VOTATION";
}

function startNight(object) {
	processDeaths(object);
	if (object.turno != "CAZAVAMPIROS" && object.turno != "FARMERS_WON" && object.turno != "VAMPIRES_WON" && object.turno != "TIE") {
		object.dia = 0;
		object.logs.push("El ocaso se acerca y con él la insaciable sed de los vampiros. ¡Escondeos y rezad por vuestras almas!");
		object.turno = rolOrder[0];
	}
}

function processDeaths(object) {
	for (var i in object.currentDeaths) {
		if (object.players[object.currentDeaths[i]] == "CAZAVAMPIROS") {//Si el cazador muere, será su turno
			object.logs.push( "¡Idiotas! ¡" + object.currentDeaths[i] + " es el cazavampiros y opondrá resistencia hasta su último aliento!");
			object.turno = "CAZAVAMPIROS";
			object.currentDeaths.splice(i, 1);
		} else {
			object.logs.push("¡" + object.currentDeaths[i] + " ha muerto!");
			//El jugador muere
			object.players[object.currentDeaths[i]] = "DEAD";
		}
	}
	object.currentDeaths = [];
	checkWin(object);
}

function checkWin(object)//Comprueba si un bando ha ganado
{   var hunterAlive = false;
	var vampiresLeft = 0;
	var farmersLeft = 0;
	for (var i in object.players) {
		if (object.players[i] == "VAMPIRO") {
			vampiresLeft++;
		}
		else if (object.players[i] != "DEAD") {
            if(object.players[i] == "CAZAVAMPIROS"){
                hunterAlive = true;
            }
			farmersLeft++;
			cosasQuePasan += "Ha entrado en farmersLeft '\n'";
		}
	}

	if (vampiresLeft == 0) {
		object.turno = "FARMERS_WON";
		object.gameState = "FINISHED";
	} else if(hunterAlive && farmersLeft == 1 && vampiresLeft == 1){
        object.turno = "TIE";
        object.gameState = "FINISHED";
    }
	else if (farmersLeft == 0) {
		object.turno = "VAMPIRES_WON";
		object.gameState = "FINISHED";
	}

}

function countNumVotes(object) {
	var num = 0;
	for (var i in object.votation) {
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

function playedNextTurn(object) {
	for (var i in object.players) {
		if ((object.players[i] == object.turno)
			|| (object.turno == "POPULAR_VOTATION" && object.players[i] != "DEAD"))
			object.played[i] = 1;
	}
}