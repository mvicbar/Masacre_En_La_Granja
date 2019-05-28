var turno = "";
var endGame = 1;
var played = 0; // played = 0 ===> no es tu turno(o ya has jugado); played = 1 ===> puedes realizar una jugada
var currentDeaths = [];

function cargarPartida() {
    var option = -1;

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
                console.log("gameState: " + status.gameState);
                console.log("turno: " + status.turno);
                console.log("dia: " + status.dia);
                console.log("acciones: " + status.acciones);
                console.log("currentDeaths: " + status.currentDeaths);
                console.log("votes: " + status.votes);
                console.log("Jugadores en el JSON: " + status.players);
                endGame = (status.gameState == "FINISHED") ? 1 : 0;
                console.log("end game: " + endGame);
                currentDeaths = status.currentDeaths;
                played = status.played[clientPlayer];
                console.log(status.played);
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
                console.log("MIERDA!! ALGO HA SALIDO MAL");
            }
        });
    }
}

function popularPlay(victim_) {
    played = 1;
    //Envía jugada al servidor vía Ajax
    noteEntry("Your vote is for " + victim_);
    var playJSON = {
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
    var playJSON = {
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
    this.turno ='';
}*/

function receiveStatus(newState)//Actualiza el estado del cliente via websocket
{
    printLogs(newState.logs);
    
    /*
    noteEntry("The vampires have been eliminated. FARMERS WIN!");
    noteEntry("The weak farmers have fallen. VAMPIRES WIN!");
    */
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

function updateDeaths(deaths) {
    for (var i = 0; i < deaths.length; i++) {
        if (deaths[i] == clientRol) {//El cliente ha muerto
            clientRol = "DEAD"
            noteEntry("YOU DIED");
        }
        else {
            noteEntry(deaths[i] + " has died!");
            document.getElementById(p + "Player").innerHTML = "DEAD";
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