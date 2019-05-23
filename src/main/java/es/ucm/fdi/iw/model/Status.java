package es.ucm.fdi.iw.model;

import java.util.List;
import java.util.Map;

public class Status {

    public String momento; //En que momento del juego estamos (turno)
    /*
    inLobby

    */
    public Integer dia; //0 = si; 1 = no
    public Map<String, String> players; // Map de nombre de jugador con su rol (que puede ser DEAD)
    //public List<Long> enamorados; //Contiene dos elementos que son el Id de los jugadores enamorados
    public List<Acciones> acciones; //Es un JSON y habria que pensar si crear otra clase para mapearlo
    public List<String> currentDeaths; //Esto es para modelo.js // lista de nombres de los que estan muriendo
    public Map<String, Integer> votes; //Esto es para modelo.js // lista de nombres votados con recuento de votos
    public Map<String, Integer> played; // contiene los jugadores que han jugado ya su turno. Se mantiene a 1 (jugado). Se pone a 0 cuando se inicia un turno solo a los que pueden jugar.

}