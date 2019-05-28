actualRol = "";
endGame = 1;
played = 0; // played = 0 ===> no es tu turno(o ya has jugado); played = 1 ===> puedes realizar una jugada
currentDeaths = [];

function cargarPartida() {
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
                console.log("momento: " + status.momento);
                console.log("dia: " + status.dia);
                console.log("acciones: " + status.acciones);
                console.log("currentDeaths: " + status.currentDeaths);
                console.log("votes: " + status.votes);
                console.log("Jugadores en el JSON: " + status.players);
                endGame = (status.momento == "FINISHED") ? 1 : 0;
                console.log("end game: " + endGame);
                currentDeaths = status.currentDeaths;
                played = status.played[clientPlayer];
                console.log(status.played);
                actualRol = status.momento;
            });
        }
        else {
            console.log("NO HA SIDO POSIBLE CARGAR LA PARTIDA");
        }
    });

    for (p in players) {
        if (players[p] == clientPlayer) continue;
        document.getElementById(players[p] + "Card")
            .addEventListener("click", vote(players[p]));
    }
}

function vote(player) {
    return function () {
        if (clientRol != "DEAD" && played == 1) {
            if (actualRol == clientRol) {
                switch (actualRol) {
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
            else if (actualRol == "POPULAR_VOTATION") {
                popularPlay(player);
            }
        }
    }
}

function witchPlay(objetive) {
    if (option < 0) {
        noteEntry("Select an action, Witch");
    }
    else {
        if (option == 0 || (option == 1 && currentDeaths[0] != objetive) ||
            option == 2 && currentDeaths[0] == objetive) {
            hideOptions();
            played = 1;
            playJSON = {
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
                console.log("MIERDA!! ALGO HA SALIDO MAL");
            }
        });
    }
}

function popularPlay(victim_) {
    played = 1;
    //Envía jugada al servidor vía Ajax
    noteEntry("Your vote is for " + victim_);
    playJSON = {
        rol: 'POPULAR_VOTE',
        client: clientPlayer,
        victim: victim_,
        option: ""
    };
    fetch("/api/game/receivePlay", params).then((response) => {
        if (response.status == 200) console.log("JUGADA ENVIADA");
        else {
            console.log("MIERDA!! ALGO HA SALIDO MAL");
        }
    })
}

function vampirePlay(victim_) {
    played = 0;
    noteEntry("Your victim is " + victim_);
    //Envía jugada al servidor vía Ajax
    playJSON = {
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
        if (response.status == 200) console.log("JUGADA ENVIADA");
        else {
            console.log("MIERDA!! ALGO HA SALIDO MAL");
        }
    });

}

function hunterPlay(victim_) {
    players[clientPlayer][1] = 1;
    //Envía jugada al servidor vía Ajax
    noteEntry("You shot Player " + (victim_ + 1));
    playJSON = {
        rol: 'HUNTER',
        client: clientPlayer,
        victim: victim_,
        option: ""
    }
    fetch("/api/game/receivePlay", params).then((response) => {
        if (response.status == 200) console.log("JUGADA ENVIADA");
        else {
            console.log("MIERDA!! ALGO HA SALIDO MAL");
        }

    })
}


/*function statusUpdate() {//Para consultar
    this.id = '';
    this.deaths = [];
    this.logs = [];
    this.newRol ='';
}*/

function receiveStatus(newState)//Actualiza el estado del cliente via websocket
{
    currentDeaths = newState.currentDeaths;
    console.log("Estado de la partida: " + newState.newRol);
    switch (newState.id) {
        case "VAMPIRES_VOTED":
            actualRol = newState.newRol;
            logEntry("Vampires choosed their prey...");
            if (newState.newRol == "POPULAR_VOTATION") { updateDeaths(newState.deaths); }
            resetPlay();
            break;
        case "WITCH_PLAYED":
            actualRol = newState.newRol;
            updateDeaths(newState.deaths);
            resetPlay();
            break;
        case "POPULAR_VOTED":
            actualRol = newState.newRol;
            updateDeaths(newState.deaths);
            resetPlay();
            break;
        case "HUNTER_SHOT":
            actualRol = newState.newRol;
            updateDeaths(newState.deaths);
            resetPlay();
            break;
        case "FARMERS_WON":
            actualRol = "";
            noteEntry("The vampires have been eliminated. FARMERS WIN!");
            endGame = 1;
            break;
        case "VAMPIRES_WON":
            actualRol = "";
            noteEntry("The weak farmers have fallen. VAMPIRES WIN!");
            endGame = 1;
            break;

    }
    if (actualRol == "WITCH" && clientRol == "WITCH") witchInfo();
    if (!endGame) printLogs(newState.logs);
    if (endGame) notifyEndedGame();
}

function notifyEndedGame(){
	document.getElementById('finalizar_partida').style.display = 'flex';
}

function witchInfo() {
    if (currentDeaths[0] == null) {
        logEntry("Nobody is gonna die tonight");
        noteEntry("Nobody is gonna die tonight");
    } else {
        logEntry(currentDeaths[0] + " is gonna die tonight...");
        noteEntry(currentDeaths[0] + " is gonna die tonight...");
    }
    document.getElementById('controls').style.display = 'flex';
}

function resetPlay() {
    played = 0;
}

function updateDeaths(deaths) {
    for (i = 0; i < deaths.length; i++) {
        if (deaths[i] == clientRol) {//El cliente ha muerto
            clientRol = "DEAD"
            noteEntry("YOU DIED");
        }
        else {
            noteEntry(deaths[i] + " has died!");
            document.getElementById(deaths[i] + "Player").innerHTML = "DEAD";
        }
    }
    currentDeaths = [];
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

}
function showOptions() {
    document.getElementById('controls').style.display = 'flex';
}

cargarPartida();