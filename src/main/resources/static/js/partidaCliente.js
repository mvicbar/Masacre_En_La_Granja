var turno = "";
var currentDeaths = [];
var option = -1;

function cargarPartida() {
    console.log("Entrada en cargarPartida");
    var deads = document.getElementsByClassName("deathInfo");
    for (var i = 0; i < deads.length; i++)
      deads[i].style.display = "none";

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
            	logEntry("El ocaso se acerca y con él la insaciable sed de los vampiros." +
                    "¡Escondeos y rezad por vuestras almas!");
                console.log("Status leído del getStatus: " + text);
                var status = JSON.parse(text);
                currentDeaths = status.currentDeaths;
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
    console.log("Entrada en la función vote con player: " + player);
    return function () {
        switch (turno) {
            case "VAMPIRO":
                vampirePlay(player);
                break;
            case "CAZAVAMPIROS":
                hunterPlay(player);
                break;
            case "BRUJA":
                witchPlay(player);
                break;
            case "POPULAR_VOTATION":
                popularPlay(player);
                break;
        }
    }
}

// Option 0 -> no hace nada
// Option 1 -> mata al objetivo
// Option 2 -> protege al jugador víctima de los vampiros
function witchPlay(objective) {
    console.log("Entrada en la funcion witchPlay");
    var playJSON = {
        rol: 'BRUJA',
        client: clientPlayer,
        victim: objective,
        option: "" + option
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
            console.log("ALGO HA SALIDO MAL");
        }
    })
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
    
    noteEntry("Your vote is for " + victim_);
    fetch("/api/game/receivePlay", params).then((response) => {
        if (response.status == 200) {
            console.log("JUGADA ENVIADA");
        }
        else {
            console.log("ALGO HA SALIDO MAL");
        }
    });
}

function vampirePlay(victim_) {
    console.log("Entrada en vampirePlay con victim_: " + victim_);

    var playJSON = {
        rol: 'VAMPIRO',
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
    
    noteEntry("Esta noche quieres devorar a " + victim_ + "."
    );
    fetch("/api/game/receivePlay", params).then((response) => {
        if (response.status == 200) {
            console.log("JUGADA ENVIADA");
        }
        else {
            console.log("ALGO HA SALIDO MAL");
        }
    });

}

function hunterPlay(victim_) {
    console.log("Entrada en hunterPlay con victim_: " + victim_);

   // players[clientPlayer][1] = 1;


    //Envía jugada al servidor vía Ajax

    var playJSON = {
        rol: 'CAZAVAMPIROS',
        client: clientPlayer,
        victim: victim_,
        option: ""
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

    noteEntry("You shot " + victim_);
    fetch("/api/game/receivePlay", params).then((response) => {
        if (response.status == 200){
        console.log("JUGADA ENVIADA");
        played = 0;
        }
        else {
        console.log("ALGO HA SALIDO MAL");
        }
    });
}


function receiveStatus(newState)//Actualiza el estado del cliente via websocket
{
    console.log("Nuevo estado recibido con turno: " + newState.turno);
    printLogs(newState.logs);
    turno = newState.turno;
    currentDeaths = newState.currentDeaths;
    if(turno == "VAMPIRES_WON" || turno == "FARMERS_WON" || turno == "TIE"){
    	for(p in newState.players)
    		newState.players[p] = "DEAD";
    }
    updateDeaths(newState.players, newState.oldRols);
    
    switch (turno) {
    case "VAMPIRES_WON":    	
    	logEntry("Las vísceras y entrañas de los habitantes decoran el pueblo. " +
            "Los vampiros disfrutan del festín de sangre, mientras debaten dónde " +
            "será el siguiente.");
    	noteEntry("¡Los vampiros ganan!");
    	//revealRoles(newState.players, newState.oldRols);
        break;
    case "FARMERS_WON":
    	logEntry("Deshaciéndose en polvo y cenizas cae el último vampiro. Ahora " +
            "los aldeanos podrán volver a morir por las mismas causas de siempre.");
    	noteEntry("¡Los aldeanos ganan!");
    	//revealRoles(newState.players, newState.oldRols);
        break;
    case "TIE":
    	logEntry("No queda ni un alma en pie. Vampiros y humanos se han matado entre ellos y en el " +
            "pueblo solo se oye el graznido de los buitres.");
    	noteEntry("Todos habéis perdido.");
    	//revealRoles(newState.players, newState.oldRols);
        break;
    }
    
}

function updateDeaths(deaths, oldRols) {
	console.log("Entrada en updateDeaths");
	console.log("Array de jugadores: " + deaths);
	for(var p in deaths){
		console.log("Jugador leído del players: " + p);
		if(deaths[p] == "DEAD"){
			document.getElementById(p + 'Death').style.display = 'flex';
			document.getElementById(p + 'Death').style.alignSelf = 'center';
			document.getElementById(p + 'Death').innerHTML = oldRols[p];
			
			var icono;
			switch(oldRols[p]){
			case "VAMPIRO":
				icono = "\uD83E\uDDDB\u200D♂️";
				break;
			case "GRANJERO":
				icono = "\uD83D\uDC68\u200D\uD83C\uDF3E ";
				break;
			case "BRUJA":
				icono = "\uD83E\uDDD9\u200D♀️";
				break;
			case "CAZAVAMPIROS":
				icono = "\uD83C\uDFF9";
				break;
			}
			
			document.getElementById(p + 'Card').style.backgroundColor = 'transparent';
			document.getElementById(p + 'Card').innerHTML = icono;
		}
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
	console.log("Entrada en noteEntry");
    document.getElementById('note').innerHTML = message;
}

function printLogs(logs) {
    for (i = 0; i < logs.length; i++) {
        logEntry(logs[i]);
    }
}

cargarPartida();