package es.ucm.fdi.iw.model;

import java.util.List;
import java.util.Map;

public class Status {
    /*JSON de ejemplo
    {
        momento: 'vampirosVotan',
        esDeDia: 1,
        users:[4,35,18,26,97,35],
        userIdRol:{
            4: 'vampiro',
            35: 'granjero',
            18: 'vampiro',
            26: 'bruja',
            97: 'granjero',
            35: 'granjero'
        },
        userIdAlive:{
            4: 1,
            35: 0,
            18: 0,
            26: 0,
            97: 1,
            35: 0
        },
        enamorados:[18,35],
        acciones: [
            {
                rol: 'vampiro',
                client: 18,
                victim: 97,
                action: ''
            }
        ]
    }
    */
    public String momento; //En que momento del juego estamos (turno)
    /*
    inLobby

    */
    public Integer dia; //0 = si; 1 = no
    public Map<String, String> players; // Map de nombre de jugador con su rol (que puede ser MUERTO)
    //public List<Long> enamorados; //Contiene dos elementos que son el Id de los jugadores enamorados
    public List<Acciones> acciones; //Es un JSON y habria que pensar si crear otra clase para mapearlo
    public List<String> currentDeaths; //Esto es para modelo.js // lista de nombres de los que estan muriendo
    public Map<String, Integer> votes; //Esto es para modelo.js // lista de nombres votados con recuento de votos


}