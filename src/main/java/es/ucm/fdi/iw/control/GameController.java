package es.ucm.fdi.iw.control;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpSession;
import javax.transaction.Transactional;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import es.ucm.fdi.iw.model.Acciones;
import es.ucm.fdi.iw.model.Game;
import es.ucm.fdi.iw.model.Status;
import es.ucm.fdi.iw.model.User;

@Controller
@RequestMapping("game")
public class GameController {
    
    private static final Logger log = LogManager.getLogger(RootController.class);
    
    @Autowired
    private Environment env;
    
    @Autowired
    private IwSocketHandler iwSocketHandler;

    @Autowired
    private EntityManager entityManager;
    
    @GetMapping("/")
    @Transactional
    public String play(Model model, HttpSession session) {
        User user = (User) session.getAttribute("user"); // <-- este usuario no está conectado a la bd

        user = entityManager.find(User.class, user.getId()); // <-- obtengo usuario de la BD
        Game g = user.getActiveGame();

        Status s = new Status();
		s.dia = 0;
		s.momento = "ingame";
		s.players = new HashMap<String, String>();
		s.players.put("tor", "VAMPIRE");
        s.players.put("mac", "FARMER");
        s.currentDeaths = new ArrayList<String>();
        s.votes = new HashMap<String, Integer>();
        s.acciones = new ArrayList<Acciones>();

        g.setStatus(g.getStatusStringFromObj(s));

        entityManager.persist(g);
        entityManager.flush();

        model.addAttribute("players", s.players.keySet());
        model.addAttribute("userName", user.getName());
        model.addAttribute("userRol", s.players.get(user.getName()));
        return "pruebas/pruebaPartida";
    }

    @PostMapping("/")
    public String canPlay() {
        return "redirect:/game/";
    }

    @GetMapping("/pruebaPartida")
    @Transactional
    public String pruebaPartida(Model model, HttpSession session){
        /*User user = (User) session.getAttribute("user"); // <-- este usuario no está conectado a la bd
        user = entityManager.find(User.class, user.getId()); // <-- obtengo usuario de la BD

        Game g = user.getActiveGame();

        Status s = g.getStatusObj();

        model.addAttribute("players", s.players.keySet());
        model.addAttribute("userName", user.getName());
        model.addAttribute("userRol", s.players.get(user.getName()));*/

        Game g = new Game();
		List<User> users = new ArrayList<User>();
		User tor = entityManager.createNamedQuery("User.ByName", User.class).setParameter("userName", "tor")
				.getSingleResult();
		User mac = entityManager.createNamedQuery("User.ByName", User.class).setParameter("userName", "mac")
                .getSingleResult();
        User sir = entityManager.createNamedQuery("User.ByName", User.class).setParameter("userName", "sir")
				.getSingleResult();
		User bet = entityManager.createNamedQuery("User.ByName", User.class).setParameter("userName", "bet")
				.getSingleResult();
		users.add(tor); 
        users.add(mac); 
        users.add(sir); 
		users.add(bet); 
		g.setUsers(users);
		
		Status s = new Status();
		s.dia = 0;
		s.momento = "ingame";
		s.players = new HashMap<String, String>();
		s.players.put("tor", "VAMPIRE");
        s.players.put("mac", "VAMPIRE");
        s.players.put("sir", "FARMER");
        s.players.put("bet", "FARMER");
        s.currentDeaths = new ArrayList<String>();
        s.votes = new HashMap<String, Integer>();

		g.setStatus(g.getStatusStringFromObj(s));
		List<Game> lg = new ArrayList<Game>(); lg.add(g);
		tor.setGames(lg);
        mac.setGames(lg);
        sir.setGames(lg);
		bet.setGames(lg);
		entityManager.persist(g);
		entityManager.persist(tor);
        entityManager.persist(mac);
        entityManager.persist(sir);
		entityManager.persist(bet);
        entityManager.flush();
        
        List<String> keyUsers = new ArrayList<>();
        keyUsers.add("tor");
        keyUsers.add("mac");
        keyUsers.add("sir");
        keyUsers.add("bet");

		model.addAttribute("game", g);
        session.setAttribute("game", g);

        User user = (User) session.getAttribute("user"); // <-- este usuario no está conectado a la bd
        user = entityManager.find(User.class, user.getId()); // <-- obtengo usuario de la BD

        model.addAttribute("players", keyUsers);
        model.addAttribute("userName", user.getName());
        model.addAttribute("userRol", s.players.get(user.getName()));
        
        return "pruebas/pruebaPartida";
    }
    
}
