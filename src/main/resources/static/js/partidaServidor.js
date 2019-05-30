var roleOrder = ["VAMPIRE", "WITCH"];


function createStatus() {
	this.logs = [];
	this.turn = '';
	this.currentDeaths = [];
	this.votation = {};
	this.day = 0;//0 noche , 1 day
	this.players = {};
	this.oldRoles = {};
	this.played = [];
	this.gameState = "";
	this.availableWitchActions = 0; //0 = Ninguna, 1 = matar, 2 = revivir, 3 = ambas
}

function receivePlay(oldStateJSON, playJSON) // It also receives the game state
{
	// Game information updated from DB
	var oldState = JSON.parse(oldStateJSON);
	// Get the player, role, and action of the play and process it
	var play = JSON.parse(playJSON);
	var object = new createStatus();

	object.currentDeaths = [];
	object.day = oldState.day;
	object.players = oldState.players;
	object.votation = oldState.votes;
	object.played = oldState.played;
	object.gameState = oldState.gameState;
	object.availableWitchActions = oldState.availableWitchActions;
	object.turn = oldState.turn;
	object.oldRoles = oldState.oldRoles;

	switch (play.role) {
		case 'VAMPIRE':
			vampireMove(play, object); // Send new state to the server
			break;
		case 'HUNTER':
			hunterMove(play, object);
			break;
		case 'POPULAR_VOTE':
			object.turn = oldState.turn;
			popularMove(play, object);
			break;
		case 'WITCH':
			witchMove(play, object);
			break;
	}

	object.actions = oldState.actions;
	object.actions.push(play);

	var newStatus = {
		gameState: object.gameState,
		turn: object.turn,
		day: object.day,
		players: object.players,
		oldRoles: object.oldRoles,
		actions: object.actions,
		currentDeaths: object.currentDeaths,
		votes: object.votation,
		played: object.played,
		availableWitchActions: object.availableWitchActions
	};

	return Java.to([JSON.stringify(object), JSON.stringify(newStatus)], "java.lang.String[]");
}

// Option 0 -> witch ends her turn
// Option 1 -> witch kill objective
// Option 2 -> witch protects objective
function witchMove(play, object) {
	if (play.action === 0) { // Witch ends her turn
		endNight(object);
	} else if (play.action === 1 && play.objective !== object.currentDeaths[0]) {// Witch kills
		object.availableWitchActions = object.availableWitchActions == 3 ? 2 : 0;
		object.currentDeaths.push(play.victim);
		object.logs.push("The witch invoked the powers of Hell and forced " + play.objective + " to stab their own heart! You all shall fear the Dark Lord!");
	} else if (play.action === 2) { // Witch protect
		object.availableWitchActions = object.availableWitchActions == 3 ? 1 : 0;
		object.currentDeaths = [];
		object.logs.push("The witch begged to her unholy god and protected " + play.objective + "'s soul ! Hail the Dark Lord!");
	}
}

function popularMove(play, object) {
	// If victim was not voted before, we add their first vote, otherwise, we sum one vote
	if (object.votation[play.victim] == null) object.votation[play.victim] = 1;
	else object.votation[play.victim]++;
	if (countNumVotes(object) == countMaxVotes(object)) {
		var i = mostVotedPlayer(object);
		if (i == "") {
			object.played[play.client] = 0;
			object.logs.push("Votation tied and is almost sunset. No head will roll today.");
		} else {
			object.currentDeaths.push(i);
			object.logs.push("The farmers decided to behead " + play.victim);
		}

		startNight(object);
		if(object.turn !== "HUNTER") {
            object.turn = "VAMPIRE";
        }
		playedNextTurn(object);
		object.votation = {};
	} else {
		object.logs.push(play.client + " voted " + play.victim + "!");
	}

}

function hunterMove(play, object) {
    // The victim dies
	object.currentDeaths.push(play.victim);
	object.players[play.victim] = "DEAD";

	object.turn = 'HUNTER_SHOT';
  
  
  object.played[play.client] = 0;
	object.logs.push(play.client + " has emptied the magazine of the winchester in " + play.victim + "'s head!");

    // Hunter dies
	object.players[play.client] = "DEAD";
	object.currentDeaths.push(play.client);
    object.turn = nextRole("HUNTER", object);
    playedNextTurn(object);
    object.votation = {};

	if (object.day) { // If village beheaded the hunter, the night begins
		startNight(object);
	} else { // Otherwise, the night ends
		endNight(object);
	}

}

function vampireMove(play, object) {

	// If victim wasn't voted before, we add their first vote. Otherwise, we sum one vote
	if (object.votation[play.victim] == null) object.votation[play.victim] = 1;
	else object.votation[play.victim]++;
	object.played[play.client] = 0;
	if (countNumVotes(object) == countRole("VAMPIRE", object)) {
		var i = mostVotedPlayer(object);
		if (i != "") {
			object.currentDeaths.push(i);
			object.logs.push(play.victim + " will be prey of the thirst of the vampires. May the Eden's doors open for their soul.")
		}

		object.turn = nextRole("VAMPIRE", object);
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
		return ""; // Draw
	}

	return name; // Most voted player
}

function nextRole(role, object) {
	var j = 0;
	while (j < roleOrder.length) {
		if (role == roleOrder[j]) {
			break;
		}
		j++;
	}
	if (j >= roleOrder.length - 1) {
		return endNight(object);
	}
	else {
		j++;
		while (j < roleOrder.length) {
			if (countRole(roleOrder[j], object) > 0) {
				return roleOrder[j];
			}
			j++;
		}
		return endNight(object);
	}

}

function endNight(object) {
	processDeaths(object);

	if (object.turn == "FARMERS_WON" || object.turn == "VAMPIRES_WON" || object.turn == "TIE") {
		return object.turn;
	}

	if (object.turn != "HUNTER") {
		object.day = 1;
		object.turn = "POPULAR_VOTATION";
		for(var i in object.players){
			if(object.players[i] != "DEAD"){
				object.played[i] = 1;
			}
		}
		object.logs.push("The night has ended and the village rise a day more in this cruel, wicked world.");
	}
    else return "HUNTER";

	return "POPULAR_VOTATION";
}

function startNight(object) {
	processDeaths(object);
	if (object.turn != "HUNTER") {
		object.day = 0;
		object.logs.push("With the fallen of the sun all the villagers go to bed, fearful for their miserable lifes...");
		object.turn = roleOrder[0];
		object.currentDeaths = [];
	}
}

function processDeaths(object) {
	for (var i in object.currentDeaths) {
		if (object.players[object.currentDeaths[i]] == "HUNTER") {// If the hunter dies, then it is their turn
			object.logs.push("You fool! " + object.currentDeaths[i] + " was the hunter, and will not fall without fight!");
			object.turn = "HUNTER";
			object.currentDeaths.splice(i, 1);
		} else {
			object.logs.push((object.currentDeaths[i] + " has died!"));
			// The player dies
			object.players[object.currentDeaths[i]] = "DEAD";
		}
	}
	checkWin(object);
}

function checkWin(object) // Checks if a team has won
{   var hunterAlive = false;
	var vampiresLeft = 0;
	var farmersLeft = 0;
	for (var i in object.players) {
		if (object.players[i] == "VAMPIRE") {
			vampiresLeft++;
		}
		else if (object.players[i] != "DEAD") {
            if(object.players[i] == "HUNTER"){
                hunterAlive = true;
            }
			farmersLeft++;
		}
	}

	if (vampiresLeft == 0) {
		object.turn = "FARMERS_WON";
		object.gameState = "FINISHED";
	} else if(hunterAlive && farmersLeft == 1 && vampiresLeft == 1){
        object.turn = "TIE";
        object.gameState = "FINISHED";
    }
	else if (farmersLeft <= vampiresLeft) {
		object.turn = "VAMPIRES_WON";
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

function countRole(role, object) {
	var people = 0;
	for (var i in object.players) {
		if (object.players[i] == role) {
			people++;
		}
	}
	return people;
}

function playedNextTurn(object) {
	for (var i in object.players) {
		if ((object.players[i] == object.turn)
			|| (object.turn == "POPULAR_VOTATION" && object.players[i] != "DEAD"))
			object.played[i] = 1;
	}
}