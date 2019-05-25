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
import org.springframework.web.bind.annotation.RequestParam;

import es.ucm.fdi.iw.model.Acciones;
import es.ucm.fdi.iw.model.Game;
import es.ucm.fdi.iw.model.Status;
import es.ucm.fdi.iw.model.User;

@Controller
@RequestMapping("game")
public class GameController {

    private static final Logger log = LogManager.getLogger(RootController.class);

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
        if (g == null) return null;

      //  g.init();
        //DESCOMENTAR Y COMENTAR/BORRAR DESDE AQUI
        Status s = new Status();
        s.dia = 0;
        s.momento = "VAMPIRE";
        s.players = new HashMap<String, String>();
        s.players.put("tor", "VAMPIRE");
        s.players.put("mac", "FARMER");
        s.currentDeaths = new ArrayList<String>();
        s.votes = new HashMap<String, Integer>();
        s.acciones = new ArrayList<Acciones>();
        s.played = new HashMap<String, Integer>();
        s.played.put("tor", 1);
        s.played.put("mac", 0);

        g.setStatus(g.getStatusStringFromObj(s));

        entityManager.persist(g);
        entityManager.flush();

        //HASTA AQUI
        //mas o menos... sacar el status

        model.addAttribute("players", s.players.keySet());
        model.addAttribute("userName", user.getName());
        model.addAttribute("userRol", s.players.get(user.getName()));
        return "partida";
    }

    @PostMapping("/")
    @Transactional
    public String canPlay(Model model, HttpSession session) {

        User user = (User) session.getAttribute("user");
        user = entityManager.find(User.class, user.getId());

        Game game = user.getActiveGame();
        if(game == null) return null;

        String text = "{" + "\"comienzaLaPartida\": {" + "\"idGame\":\"" + game.getId() + "\"}}";

        for (User u : game.getUsers()) {
            iwSocketHandler.sendText(u.getName(), text);
        }
        return "redirect:/game/";
    }

}
