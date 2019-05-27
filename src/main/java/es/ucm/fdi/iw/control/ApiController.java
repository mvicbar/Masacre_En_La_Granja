package es.ucm.fdi.iw.control;

import es.ucm.fdi.iw.model.Game;
import es.ucm.fdi.iw.model.Status;
import es.ucm.fdi.iw.model.User;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import javax.servlet.http.HttpSession;
import javax.transaction.Transactional;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@RestController()
@RequestMapping("api")
public class ApiController {

	private static final Logger log = LogManager.getLogger(ApiController.class);

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private IwSocketHandler iwSocketHandler;

	@PostMapping("chat/enviar")
	@Transactional
	public ResponseEntity<?> enviar(HttpSession session, @RequestBody String mensaje) {
		User user = (User) session.getAttribute("user"); // <-- este usuario no está conectado a la bd
		user = entityManager.find(User.class, user.getId()); // <-- obtengo usuario de la BD

		Game g = user.getActiveGame();

		List<User> users = new ArrayList<>(g.getUsers());
		String message = "{" + "\"chatMessage\": {" + "\"propietario\":\"" + user.getName() + "\"," + "\"mensaje\":\""
				+ mensaje + "\"}}";
		Status s = g.getStatusObj();
		String rolPropietario = s.players.get(user.getName());
		for (User u : users) {
			if (rolPropietario.equals("DEAD") && s.players.get(u.getName()).equals("DEAD")) {
				iwSocketHandler.sendText(u.getName(), message);
			} else if (s.dia == 1) {
				if (!rolPropietario.equals("DEAD") && !s.players.get(u.getName()).equals("DEAD")) {
					iwSocketHandler.sendText(u.getName(), message);
				}
			} else if (s.dia == 0) {
				if (rolPropietario.equals("VAMPIRE") && s.players.get(u.getName()).equals("VAMPIRE")) {
					iwSocketHandler.sendText(u.getName(), message);
				}
			}
		}
		log.debug("Mensaje enviado [{}]", mensaje);
		return ResponseEntity.status(HttpStatus.OK).build();
	}

	// Función para comprobar que el nombre del user que se va a registrar no existe
	@PostMapping("user/loginOk/{name}")
	public ResponseEntity<?> existingName(@PathVariable String name) {
		// Mirar en la base de datos mágicamente para ver si está creado
		Long usersWithLogin = entityManager.createNamedQuery("User.HasName", Long.class).setParameter("userName", name)
				.getSingleResult();
		// si creado
		if (usersWithLogin == 0)
			return ResponseEntity.status(HttpStatus.OK).build();
		return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
	}

	@PostMapping("/game/receivePlay")
	@Transactional
	public ResponseEntity<?> receivePlay(HttpSession session, @RequestBody String jugada) {

		User user = (User) session.getAttribute("user"); // <-- este usuario no está conectado a la bd
		user = entityManager.find(User.class, user.getId()); // <-- obtengo usuario de la BD

		Game g = user.getActiveGame();
		if(g == null) return null;

		List<User> users = new ArrayList<>(g.getUsers());

		String[] result = procesarJugada(jugada, g.getStatus());
		String nuevoEstado = result[1];
		log.info(result[2]);
		log.info("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
		log.info("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
		log.info("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
		log.info("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
		log.info(nuevoEstado);
		g.setStatus(nuevoEstado);
		entityManager.persist(g);
		entityManager.flush();

		String object = result[0];
		log.info("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
		log.info("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
		log.info("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
		log.info("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
		log.info(object);

		String message = "{" + "\"nuevoEstado\":" + object + "}";

		for (User u : users) {
			iwSocketHandler.sendText(u.getName(), message);
		}
		log.debug("Jugada enviada: [{}]", jugada);
		return ResponseEntity.status(HttpStatus.OK).build();
	}

	private String[] procesarJugada(String jugada, String state) {

		ScriptEngineManager manager = new ScriptEngineManager();
		ScriptEngine engine = manager.getEngineByName("JavaScript");
		// read script file
		try {
			engine.eval(new InputStreamReader(getClass().getResourceAsStream("/static/js/modelo.js"))); // relativo a
																										// src/main/resources
		} catch (ScriptException e) {
			log.warn("Error loading script", e);
		}

		Invocable inv = (Invocable) engine;
		String[] result = null;
		// call function from script file
		try {
			result = (String[]) inv.invokeFunction("receivePlay", state, jugada);
		} catch (NoSuchMethodException | ScriptException e) {
			log.warn("Error running script", e);
		}
		log.warn(result);
		return result;
	}

	@PostMapping("/game/getStatus")
	@Transactional
	public ResponseEntity<String> getGameStatus(HttpSession session){

		User user = (User) session.getAttribute("user"); // <-- este usuario no está conectado a la bd
		user = entityManager.find(User.class, user.getId()); // <-- obtengo usuario de la BD

		Game g = user.getActiveGame();
		if(g == null) return null;
		return ResponseEntity.ok(g.getStatus());
	}

	//Función para comprobar que la partida puede empezar
    @PostMapping("/lobby/startGameOk/{gameID}")
    @Transactional
    public ResponseEntity enoughPlayers(@PathVariable String gameID){
        //Mirar en la base de datos mágicamente para ver si está creado
        Game game = entityManager.createNamedQuery("Game.getGame", Game.class)
                .setParameter("gameID", Long.parseLong(gameID)).getSingleResult();

        if(game.canBegin()) return ResponseEntity.status(HttpStatus.OK).build();
        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
    }
}
