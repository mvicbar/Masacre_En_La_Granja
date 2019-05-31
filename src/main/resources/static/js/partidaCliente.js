var turno = "";
var currentDeaths = [];
var option = -1;
var deaths = {};

function cargarPartida() {
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
                logEntry("El ocaso se acerca y con él la sed de sangre de los " +
                    "vampiros. Rezad vuestras plegarias.");
                var status = JSON.parse(text);
                currentDeaths = status.currentDeaths;
                turno = status.turno;
            });
        }
        else {

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
        switch (turno) {
            case "VAMPIRO":
                vampiroPlay(player);
                break;
            case "CAZAVAMPIROS":
                cazavampirosPlay(player);
                break;
            case "BRUJA":
                brujaPlay(player);
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
function brujaPlay(objective) {
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
    })
}

function popularPlay(victim_) {

    var playJSON = {
        rol: 'POPULAR_VOTE',
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

    fetch("/api/game/receivePlay", params).then((response) => {});
}

function vampiroPlay(victim_) {

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

    fetch("/api/game/receivePlay", params).then((response) => {});

}

function cazavampirosPlay(victim_) {

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

    fetch("/api/game/receivePlay", params).then((response) => {});
}


function receiveStatus(newState)//Actualiza el estado del cliente via websocket
{
    printLogs(newState.logs);
    turno = newState.turno;
    currentDeaths = newState.currentDeaths;
    deaths = newState.deaths;

    updateDeaths(deaths);

    switch (turno) {
    case "VAMPIROS_WON":
    	logEntry("Las vísceras y entrañas de los granjeros se esparcen por " +
            "todo el pueblo y los vampiros disfrutan de su festín de sangre, " +
            "mientras eligen dónde será el próximo");
    	noteEntry("¡Los vampiros vuelven a ganar!");
        break;
    case "GRANJEROS_WON":
    	logEntry("Para sorpresa de todos, el último vampiro se deshace en " +
            "polvo y cenizas. Los granjeros respiran aliviados. Ya pueden volver" +
            "a morir por las causas habituales de siempre.");
    	noteEntry("Contra todo pronóstico, el pueblo gana.");
        break;
    case "TIE":
    	logEntry("El pueblo se queda en silencio, habitado únicamente por " +
            "buitres y fantasmas. Brujas, cazadores, vampiros y granjeros... " +
            "Todos han muerto.");
    	noteEntry("Todos sois perdedores. Solo gana el Ominoso.");
        break;
    }

}

function updateDeaths(deaths) {
    for (var p in deaths) {
        document.getElementById(p + 'Death').style.display = 'flex';
        document.getElementById(p + 'Death').style.alignSelf = 'center';
        document.getElementById(p + 'Death').innerHTML = deaths[p];

        var icono;
        switch (deaths[p]) {
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


function logEntry(message) {
    date = new Date();
    document.getElementById('log').innerHTML += "\n" + date.getHours() + ":"
        + date.getMinutes() + ":"
        + date.getSeconds() + "  "
        + message;
    
    document.getElementById('log').scrollTop = document.getElementById('log').scrollHeight;
}

function noteEntry(message) {
    document.getElementById('note').innerHTML = message;
}

function printLogs(logs) {
    for (i = 0; i < logs.length; i++) {
        logEntry(logs[i]);
    }
}

cargarPartida();