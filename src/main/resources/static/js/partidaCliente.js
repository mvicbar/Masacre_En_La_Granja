var turno = "";
var endGame = 1;
var played = 0; // played = 0 ===> no es tu turno(o ya has jugado); played = 1 ===> puedes realizar una jugada
var currentDeaths = [];
var option = -1;

function cargarPartida() {
	console.log("Entrada en cargarPartida");
    document.getElementById("controlA").addEventListener("click", function () {
        option = 1;
        document.getElementById("controlA").style.backgroundColor = '#1D1C1C';
        document.getElementById("controlB").style.backgroundColor = '#782112';
    });
    document.getElementById("controlB").addEventListener("click", function () {
        option = 2;
        document.getElementById("controlB").style.backgroundColor = '#1D1C1C';
        document.getElementById("controlA").style.backgroundColor = '#782112';
    });
    document.getElementById("controlC").addEventListener("click", function () {
        option = 0; vote(-1);
    });
    hideOptions();

    const headers = {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": config.csrf.value
    };
    const params = {
        method: 'POST',
        headers: headers
    };

    fetch("/api/game/getStatus", params).then((response) => {
        if (response.status == 200) {
            response.text().then(function (text) {
                console.log("Status leído del getStatus: " + text);
                var status = JSON.parse(text);
                endGame = (status.gameState == "FINISHED") ? 1 : 0;
                currentDeaths = status.currentDeaths;
                played = status.played[clientPlayer];
                turno = status.turno;
            });
        }
        else {
            console.log("NO HA SIDO POSIBLE CARGAR LA PARTIDA");
        }
    });

    for (var p in players) {
        if (players[p] == clientPlayer) continue;
        document.getElementById(players[p] + "Card")
            .addEventListener("click", vote(players[p]));
    }
}

function vote(player) {
	console.log("Entrada en la función vote con player: " + player);
    return function () {
        if (clientRol != "DEAD" && played == 1) {
            if (turno == clientRol) {
                switch (turno) {
                    case "VAMPIRE":
                        vampirePlay(player);
                        break;
                    case "HUNTER":
                        hunterPlay(player);
                        break;
                    case "WITCH":
                        witchPlay(player);
                        break;
                }
            }
            else if (turno == "POPULAR_VOTATION") {
                popularPlay(player);
            }
        }
    }
}
log
function witchPlay(objetive) {
    if (option < 0) {
        noteEntry("Select an action, Witch");
    }
    else {
        if (option == 0 || (option == 1 && currentDeaths[0] != objetive) ||
            option == 2 && currentDeaths[0] == objetive) {
            hideOptions();
            played = 1;
            var playJSON = {
                rol: 'WITCH',
                client: clientPlayer,
                victim: objetive,
                option: "" + option
            }
        } else {
            noteEntry("You can't do that, Witch");
        }

        var text = JSON.stringify(playJSON);
        const headers = {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": config.csrf.value
        };
        const params = {
            method: 'POST',
            headers: headers,
            body: text
        };
        fetch("/api/game/receivePlay", params).then((response) => {
            if (response.status == 200) console.log("JUGADA ENVIADA");
            else {
                console.log("ALGO HA SALIDO MAL");
            }
        });
    }
}

function popularPlay(victim_) {
	console.log("Entrada en popularPlay con victim_: " + victim_);

    var playJSON = {
        rol: 'POPULAR_VOTE',
        client: clientPlayer,
        victim: victim_,
        option: ""
    };
    var text = JSON.stringify(playJSON);
    console.log("Jugada enviada: " + text);
    const headers = {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": config.csrf.value
    };
    const params = {
        method: 'POST',
        headers: headers,
        body: text
    };
    fetch("/api/game/receivePlay", params).then((response) => {
        if (response.status == 200){
            console.log("JUGADA ENVIADA");
            played = 0;
            noteEntry("Your vote is for " + victim_);
        }
        else {
            console.log("ALGO HA SALIDO MAL");
        }
    });
}

function vampirePlay(victim_) {
	console.log("Entrada en vampirePlay con victim_: " + victim_);

    var playJSON = {
        rol: 'VAMPIRE',
        client: clientPlayer,
        victim: victim_,
        option: ""
    };
    var text = JSON.stringify(playJSON);
    const headers = {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": config.csrf.value
    };
    const params = {
        method: 'POST',
        headers: headers,
        body: text
    };
    fetch("/api/game/receivePlay", params).then((response) => {
        if (response.status == 200){
            console.log("JUGADA ENVIADA");
            played = 0;
            noteEntry("Your victim is " + victim_);
        }
        else {
            console.log("ALGO HA SALIDO MAL");
        }
    });

}

function hunterPlay(victim_) {
    players[clientPlayer][1] = 1;
    //Envía jugada al servidor vía Ajax
    noteEntry("You shot Player " + (victim_ + 1));
    var playJSON = {
        rol: 'HUNTER',
        client: clientPlayer,
        victim: victim_,
        option: ""
    }
    fetch("/api/game/receivePlay", params).then((response) => {
        if (response.status == 200) console.log("JUGADA ENVIADA");
        else {
            console.log("ALGO HA SALIDO MAL");
        }

    })
}

function receiveStatus(newState){ //Actualiza el estado del cliente via websocket
	console.log("Nuevo estado recibido");
    printLogs(newState.logs);
    newState.logs = [];
    played = newState.played[clientPlayer];
    turno = newState.turno;
    updateDeaths(newState.currentDeaths, newState.oldRols);
    
    if(newState.gameState == "FINISHED")
    	notifyEndedGame();
}

function notifyEndedGame(){
	document.getElementById('finalizar_partida').style.display = 'flex';
}

function witchInfo(message) {

    printLogs(message);
    /*
    if (currentDeaths[0] == null) {
        logEntry("Nobody is gonna die tonight");
        noteEntry("Nobody is gonna die tonight");
    } else {
        logEntry(currentDeaths[0] + " is gonna die tonight...");
        noteEntry(currentDeaths[0] + " is gonna die tonight...");
    }
    */
    document.getElementById('controls').style.display = 'flex';
}

function resetPlay() {
    played = 0;
}

function updateDeaths(deaths, oldRols) {
	console.log("Entrada en updateDeaths");
	for(i=0; i < deaths.length; i++){
		noteEntry("Player "+ deaths[i] +" has died!");
		document.getElementById(deaths[i] + 'Dead').style.display = 'flex';
		document.getElementById(deaths[i] + 'Dead').innerHTML = oldRols[deaths[i]];
		
		var icono;
		switch(oldRols[deaths[i]]){
		case "VAMPIRE":
			icono = "\uD83E\uDDDB\u200D♂️";
			break;
		case "FARMER":
			icono = "\uD83D\uDC68\u200D\uD83C\uDF3E ";
			break;
		case "WITCH":
			icono = "\uD83E\uDDD9\u200D♀️";
			break;
		case "HUNTER":
			icono = "\uD83C\uDFF9";
			break;
		}
		
		document.getElementById(deaths[i] + 'Card').style.backgroundColor = 'transparent';
		document.getElementById(deaths[i] + 'Card').innerHTML = icono;
	}
	
}

function logEntry(message) {
    date = new Date();
    document.getElementById('log').innerHTML += "\n" + date.getHours() + ":"
        + date.getMinutes() + ":"
        + date.getSeconds() + "  "
        + message;
}

function noteEntry(message) {
    document.getElementById('note').innerHTML = message;
}

function printLogs(logs) {
    for (i = 0; i < logs.length; i++) {
        logEntry(logs[i]);
    }
}

function hideOptions() {
    document.getElementById("controlA").style.backgroundColor = '#782112';
    document.getElementById("controlB").style.backgroundColor = '#782112';
    document.getElementById('controls').style.display = 'none';
    document.getElementById('finalizar_partida').style.display = 'none';
    
    var deads = document.getElementsByClassName("deadInfo");
    for (var i = 0; i < deads.length; i++)
      deads[i].style.display = "none";

}
function showOptions() {
    document.getElementById('controls').style.display = 'flex';
}

cargarPartida();