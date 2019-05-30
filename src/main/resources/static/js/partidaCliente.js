var turn = "";
var endGame = 1;
var currentDeaths = [];
var option = -1;

function loadGame() {
    console.log("loadGame");
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
                console.log("Status read from getStatus: " + text);
                var status = JSON.parse(text);
                endGame = (status.gameState == "FINISHED") ? 1 : 0;
                currentDeaths = status.currentDeaths;
                console.log(status.played);
                turn = status.turn;
            });
        }
        else {
            console.log("UNABLE TO LOAD THE GAME");
        }
    });

    for (var p in players) {
        if (players[p] == clientPlayer) continue;
        document.getElementById(players[p] + "Card")
            .addEventListener("click", vote(players[p]));
    }
}

function vote(player) {
    console.log("vote with player: " + player);
    return function () {
        switch (turn) {
            case "VAMPIRE":
                vampirePlay(player);
                break;
            case "HUNTER":
                hunterPlay(player);
                break;
            case "WITCH":
                witchPlay(player);
                break;
            case "POPULAR_VOTATION":
                popularPlay(player);
                break;
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
            var playJSON = {
                role: 'WITCH',
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
            if (response.status == 200) console.log("MOVE SENT");
            else {
                console.log("SOMETHING WENT WRONG");
            }
        });
    }
}

function popularPlay(victim_) {
    console.log("popularPlay with victim_: " + victim_);

    var playJSON = {
        role: 'POPULAR_VOTE',
        client: clientPlayer,
        victim: victim_,
        option: ""
    };
    var text = JSON.stringify(playJSON);
    console.log("Move sent: " + text);
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
        if (response.status == 200) {
            console.log("MOVE SENT");
            noteEntry("Your vote is for " + victim_);
        }
        else {
            console.log("SOMETHING WENT WRONG");
        }
    });
}

function vampirePlay(victim_) {
    console.log("vampirePlay with victim_: " + victim_);

    var playJSON = {
        role: 'VAMPIRE',
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
        if (response.status == 200) {
            console.log("MOVE SENT");
            noteEntry("Your victim is " + victim_);
        }
        else {
            console.log("SOMETHING WENT WRONG");
        }
    });

}

function hunterPlay(victim_) {
    console.log("hunterPlay with victim_: " + victim_);

   // players[clientPlayer][1] = 1;


    // Sends the move to the server by Ajax

    var playJSON = {
        role: 'HUNTER',
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


    fetch("/api/game/receivePlay", params).then((response) => {
        if (response.status == 200){
        console.log("MOVE SENT");
        played = 0;
        noteEntry("You shot " + victim_);
        }
        else {
            console.log("SOMETHING WENT WRONG");
        }
    });
}


function receiveStatus(newState)//Updates client's status by websocket
{
    console.log("New state received");
    printLogs(newState.logs);
    turn = newState.turn;
    updateDeaths(newState.currentDeaths, newState.oldRoles);
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
	console.log("Update deaths");
	for(i=0; i < deaths.length; i++){
		noteEntry(deaths[i] +" has died!");
		document.getElementById(deaths[i] + 'Death').style.display = 'flex';
		document.getElementById(deaths[i] + 'Death').style.alignSelf = 'center';
		document.getElementById(deaths[i] + 'Death').innerHTML = oldRoles[deaths[i]];
		
		var icon;
		switch(oldRols[deaths[i]]){
		case "VAMPIRE":
			icon = "\uD83E\uDDDB\u200D♂️";
			break;
		case "FARMER":
			icon = "\uD83D\uDC68\u200D\uD83C\uDF3E ";
			break;
		case "WITCH":
			icon = "\uD83E\uDDD9\u200D♀️";
			break;
		case "HUNTER":
			icon = "\uD83C\uDFF9";
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

loadGame();