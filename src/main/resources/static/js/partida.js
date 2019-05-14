actualRol= "VAMPIRE";
endGame=0;
/*players= [[]];
option = -1;
for(i=0; i<numPlayers; i++)
{
    players[i]=[];//player rol
    players[i][1]=0;//the player has played flag FOR DEBUG
}
players[0][0] = "VAMPIRE";
players[1][0] = "HUNTER";
players[2][0] = "WITCH";
players[3][0] = "FARMER";
players[4][0] = "FARMER";
players[5][0] = "VAMPIRE";
players[6][0] = "FARMER";
players[7][0] = "FARMER";*/

clientPlayer = userName;
clientRol = userRol;
played = 0;
currentDeaths = [];
//nextRound();


function vote(player)
{

    if((actualRol == userRol || actualRol == "POPULAR_VOTATION") && userRol != "DEAD" && played==0){
        if((player != clientPlayer)||
          (actualRol == "WITCH" && option == 2)){

            switch(actualRol)
            {
                case "VAMPIRE":
                    vampirePlay(player);
                    break;
                case "HUNTER":
                    hunterPlay(player);
                    break;
                case "POPULAR_VOTATION":
                    popularPlay(player);
                    break;
                case "WITCH":
                    witchPlay(player);
                    break;
                    
            }
        }
        else noteEntry("THAT'S YOU, FOOL!!")
    }
}

function witchPlay(objetive)
{
    if(option < 0){
        noteEntry("Select an action, Witch");
    }
    else{        
        if(option == 0 || (option == 1 && currentDeaths[0]!=objetive)||
           option == 2 && currentDeaths[0]==objetive){
            hideOptions();
            played = 1;
            playJSON = {
                rol: 'WITCH',
                client: clientPlayer,
                victim: objetive,
                action: option,
            }
        }else{
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
        }
        fetch("/api/game/recivePlay", params).then((response) => {
            if (response.status == 200) console.log("JUGADA ENVIADA");
            else{
                console.log("MIERDA!! ALGO HA SALIDO MAL");
            }
        });
    }
}

function popularPlay(victim_)
{
    players[clientPlayer][1] = 1;
    //Envía jugada al servidor vía Ajax
    noteEntry("Your vote is for Player "+ (victim_+1));
    playJSON = {
        rol: 'POPULAR_VOTE',
        client: clientPlayer,
        victim: victim_,
    }
    reciveStatus(recivePlay(JSON.stringify(playJSON)));//provisional
}

function vampirePlay(victim_)
{
    players[clientPlayer][1] = 1;
    noteEntry("Your victim is Player "+ (victim_+1));
    //Envía jugada al servidor vía Ajax
    playJSON = {
        rol: 'VAMPIRE',
        client: clientPlayer,
        victim: victim_,
    }
    reciveStatus(recivePlay(JSON.stringify(playJSON)));//provisional

}

function hunterPlay(victim_)
{
    players[clientPlayer][1] = 1;
    //Envía jugada al servidor vía Ajax
    noteEntry("You shot Player "+ (victim_+1));
    playJSON = {
        rol: 'HUNTER',
        client: clientPlayer,
        victim: victim_,
    }
    reciveStatus(recivePlay(JSON.stringify(playJSON)));//provisional

}


/*function statusUpdate() {//Para consultar
    this.id = '';
    this.deaths = [];
    this.logs = [];
    this.newRol ='';
}*/

function reciveStatus(newStateJSON)//Actualiza el estado del cliente via websocket
{
    var newState = JSON.parse(newStateJSON);
    currentDeaths = newState.deaths;
    switch(newState.id)
    {
        case "VAMPIRES_VOTED":
            actualRol = newState.newRol;
            logEntry("Vampires choosed their prey...");
            if(newState.newRol == "POPULAR_VOTATION"){ updateDeaths(newState.deaths);}
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
            actualRol="";
            noteEntry("The vampires have been eliminated. FARMERS WIN!");
            endGame =1;
            break;
        case "VAMPIRES_WON":
            actualRol="";
            noteEntry("The weak farmers have fallen. VAMPIRES WIN!");
            endGame=1;
            break;

    }
    if(actualRol == "WITCH" && clientRol =="WITCH") witchInfo();
    if(!endGame) printLogs(newState.logs);
}
function witchInfo()
{
    if(currentDeaths[0] == null){
        logEntry("Nobody is gonna die tonight");
        noteEntry("Nobody is gonna die tonight");
    }else{
        logEntry("Player " + (currentDeaths[0]+1)+ " is gonna die tonight...");
        logEntry("Player " + (currentDeaths[0]+1)+ " is gonna die tonight...");
    }
    document.getElementById('controls').style.display = 'flex';  
}
function repeatPlay(rol)
{
    for (var i = 0; i < players.length; i++) {
        if(players[i][0] == rol){
            players[i][1] = 0;
        }
    }
}

function resetPlay()
{
    for (var i = 0; i < players.length; i++) {
        players[i][1] = 0;
    }
}

function updateDeaths(deaths)
{
    for(i=0; i < deaths.length; i++){
        players[deaths[i]][0] = "DEAD";
        noteEntry("Player "+ (deaths[i]+1) +" has died!");
        document.getElementById('player'+(deaths[i]+1)+'card').innerHTML = "DEAD";
    }
    currentDeaths=[];
}

function logEntry(message)
{
    date= new Date();
    document.getElementById('log').innerHTML += "\n"+ date.getHours()+":"
    + date.getMinutes()+":"
    + date.getSeconds()+"  "
    +message;
}
function noteEntry(message)
{
    document.getElementById('note').innerHTML = message;
}
function printLogs(logs)
{
    for(i =0; i< logs.length; i++){
        logEntry(logs[i]);
    }
}

function hideOptions()
{
 document.getElementById("controlA").style.backgroundColor = '#782112';
 document.getElementById("controlB").style.backgroundColor = '#782112';
 document.getElementById('controls').style.display = 'none';
}

for(p in players){
    document.getElementById(p+"Card").addEventListener("click", function() 
    { vote(p);})
}


document.getElementById("controlA").addEventListener("click", function() 
{ option = 1;
 document.getElementById("controlA").style.backgroundColor = '#1D1C1C';
 document.getElementById("controlB").style.backgroundColor = '#782112';
})
document.getElementById("controlB").addEventListener("click", function() 
{ option = 2;
 document.getElementById("controlB").style.backgroundColor = '#1D1C1C';
 document.getElementById("controlA").style.backgroundColor = '#782112';
})
document.getElementById("controlC").addEventListener("click", function() 
{ option = 0; vote(-1);})

//FOR DEBUG
document.getElementById("player1").addEventListener("click", function() 
{ changePlayer(0);})
document.getElementById("player2").addEventListener("click", function() 
{ changePlayer(1);})
document.getElementById("player3").addEventListener("click", function() 
{ changePlayer(2);})
document.getElementById("player4").addEventListener("click", function() 
{ changePlayer(3);})
document.getElementById("player5").addEventListener("click", function() 
{ changePlayer(4);})
document.getElementById("player6").addEventListener("click", function() 
{ changePlayer(5);})
document.getElementById("player7").addEventListener("click", function() 
{ changePlayer(6);})
document.getElementById("player8").addEventListener("click", function() 
{ changePlayer(7);})


function changePlayer(player)
{
    clientPlayer = player;
    clientRol = players[clientPlayer][0];
    document.getElementById('plaNo').innerHTML = "You are Player " +(player+1);
    document.getElementById('plaRol').innerHTML = clientRol;
    if(clientRol == "WITCH" && actualRol == clientRol){
          witchInfo();
    }else{
         hideOptions();
    }

}

