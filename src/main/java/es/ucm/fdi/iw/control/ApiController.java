package es.ucm.fdi.iw.control;

import es.ucm.fdi.iw.LocalData;
import es.ucm.fdi.iw.model.Game;
import es.ucm.fdi.iw.model.Status;
import es.ucm.fdi.iw.model.User;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.transaction.Transactional;
import java.io.*;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@RestController()
@RequestMapping("api")
public class ApiController {

	private static final Logger log = LogManager.getLogger(ApiController.class);

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private IwSocketHandler iwSocketHandler;

	@Autowired
	private LocalData localData;

	@PostMapping("chat/enviar")
	@Transactional
	public ResponseEntity enviar(Model model, HttpSession session, 
			@RequestBody String mensaje) {
		User user = (User) session.getAttribute("user"); // <-- este usuario no está conectado a la bd
		user = entityManager.find(User.class, user.getId()); // <-- obtengo usuario de la BD
		
		for(Game game : user.getGames())
		{
			log.info(game.toString());
		}
		
		Game g = user.getActiveGame();

		List<User> users = new ArrayList<>(g.getUsers());
		String message = "{"
				+ "\"chatMessage\": {"
					+ "\"propietario\":\"" 
					+ user.getName() + "\","
					+ "\"mensaje\":\"" 
					+ mensaje + "\"}}";
		Status s = g.getStatusObj();
		String rolPropietario = s.players.get(user.getId());
		for (User u : users) {
			if (rolPropietario.equals("MUERTO") && s.players.get(u.getId()).equals("MUERTO")) {
				iwSocketHandler.sendText(u.getName(), message);
			} else if (s.dia == 0) {
				if (!rolPropietario.equals("MUERTO") && !s.players.get(u.getId()).equals("MUERTO")) {
					iwSocketHandler.sendText(u.getName(), message);
				}
			} else if (s.dia == 1) {
				if (rolPropietario.equals("VAMPIRE") && s.players.get(u.getId()).equals("VAMPIRE")) {
					iwSocketHandler.sendText(u.getName(), message);
				}
			}
		}
		log.debug("Mensaje enviado [{}]", mensaje);
		return ResponseEntity.status(HttpStatus.OK).build();
	}
}
