package es.ucm.fdi.iw.control;

import es.ucm.fdi.iw.model.Game;
import es.ucm.fdi.iw.model.User;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpSession;
import javax.transaction.Transactional;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Controller
@RequestMapping("lobby")
public class LobbyController {

    private static final Logger log = LogManager.getLogger(LobbyController.class);

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private IwSocketHandler iwSocketHandler;

    @Transactional
    public void addUserToGame(HttpSession session, Game game) {
        User user = (User) session.getAttribute("user"); // <-- este usuario no está conectado a la bd
        user = entityManager.find(User.class, user.getId()); // <-- obtengo usuario de la BD

        if (!game.getUsers().contains(user)) { // Añadimos al usuario si no está ya dentro
            game.addUser(user);
            user.getGames().add(game);
            entityManager.persist(user);
            entityManager.persist(game);
            entityManager.flush();
            List<User> users = new ArrayList<>(game.getUsers());
            String message = "{\"newPlayer\": \" " + user.getName() + " \" }";
            for (User u : users) {
                if (u == user)
                    continue;
                iwSocketHandler.addNewUserLobby(u.getName(), message);
            }
        }
    }

    @Transactional
    @GetMapping("/newgame")
    public String newGame(HttpSession session) {
        Game game = new Game();
        game.setCreationTime(Date.valueOf(LocalDate.now()));
        game.initLobby();
        addUserToGame(session, game);
        return "redirect:/lobby/" + game.getId();
    }

    @GetMapping("/{idGame}")
    @Transactional
    public String showLobby(Model model, @PathVariable String idGame) {
        Game game = entityManager.find(Game.class, Long.parseLong(idGame));
        return getLobby(model, game);
    }

    @PostMapping("/{idGame}")
    @Transactional
    public String showLobbyPost(Model model, @PathVariable String idGame) {
        Game game = entityManager.find(Game.class, Long.parseLong(idGame));
        return getLobby(model, game);
    }
    
    @Transactional
    public String getLobby(Model model, Game game) {
        model.addAttribute("game", game);

        if (game != null) { // Si el juego exite
            log.info("El juego existe");
            List<User> users = new ArrayList<>(game.getUsers());
            model.addAttribute("jugadores", users);
        }
        else {
            log.info("El juego no existe");
        }
        return "lobby";
    }

    @GetMapping("/{idGame}/join")
    @Transactional
    public String joinLobby(Model model, HttpSession session, @PathVariable String idGame) {
        Game game = entityManager.find(Game.class, Long.parseLong(idGame));

        if (game == null) {
            model.addAttribute("errorMessage", "¡Esa partida no existe!");
            return "elegirPartida";
        } else if (game.started()) {
             model.addAttribute("errorMessage", "¡La partida ya ha empezado!");
            return "elegirPartida";
        } else {
            addUserToGame(session, game);

            return getLobby(model, game);
        }
    }

    @PostMapping("/{idGame}/leave")
    @Transactional
    public String leaveLobby(HttpSession session, @PathVariable String idGame) {
        User user = (User) session.getAttribute("user");
        Game game = entityManager.find(Game.class, Long.parseLong(idGame));

        if (game != null && !game.started()) {
            user = entityManager.find(User.class, user.getId());
            game.getUsers().remove(user);
            user.getGames().remove(game);
            entityManager.persist(user);
            entityManager.persist(game);
            entityManager.flush();
        }

        return "redirect:/user/searchGame";
    }

    //Función para comprobar que la partida puede empezar
    @PostMapping("/startGameOk/{gameID}")
    @Transactional
    public ResponseEntity enoughPlayers(@PathVariable String gameID){
        //Mirar en la base de datos mágicamente para ver si está creado
        Game game = entityManager.createNamedQuery("Game.getGame", Game.class)
                .setParameter("gameID", Long.parseLong(gameID)).getSingleResult();

        if(game.canBegin()) return ResponseEntity.status(HttpStatus.OK).build();
        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
    }
  
    @GetMapping("select")
    public String showSelect() {
        return "elegirPartida";
    }

    @PostMapping("select")
    public String selectGame(@RequestParam String gameID) {
        return "redirect:/lobby/" + gameID + "/join";
    }

    @GetMapping("/random")
    @Transactional
    public String randomGame() {
        List<Game> games = entityManager.createNamedQuery("Game.all", Game.class).getResultList();
        Iterator<Game> iterator = games.iterator();
        Game game = null;

        if (iterator.hasNext()) {
            game = iterator.next();
            while (iterator.hasNext() && game.started()) {
                game = iterator.next();
            }
        }

        if (game != null) {
            return "redirect:/lobby/" + game.getId() + "/join";
        } else { // Si no hay un juego disponible, entonces lo crea
            return "redirect:/lobby/newgame";
        }
    }
}
