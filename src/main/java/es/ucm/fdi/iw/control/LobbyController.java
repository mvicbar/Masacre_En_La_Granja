package es.ucm.fdi.iw.control;

import es.ucm.fdi.iw.LocalData;
import es.ucm.fdi.iw.model.Game;
import es.ucm.fdi.iw.model.User;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpSession;
import javax.transaction.Transactional;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Controller
@RequestMapping("lobby")
public class LobbyController {
    
    private static final Logger log = LogManager.getLogger(LobbyController.class);
    
    @Autowired
    private EntityManager entityManager;
    
    @Autowired
    private LocalData localData;
    
    @Transactional
    @GetMapping("/newgame")
    public String newGame(Model model, HttpSession session) {
        User user = (User) session.getAttribute("user");
        String redirect = "redirect:/user/login";
        
        if(user != null) {
            Game game = new Game();
    
            game.addUser(user);
            log.info("He aquí nuestro usuario ->" + user);
            game.setCreationTime(Date.valueOf(LocalDate.now()));
            user.getGames().add(game);
            
            entityManager.persist(game);
            entityManager.flush();
            
            
            redirect = "redirect:/lobby/" + game.getId();
        }
        
        return redirect;
    }
    
    @GetMapping("/{idGame}")
    @Transactional
    public String getLobby(Model model, @PathVariable String idGame) {
        
        Game game = entityManager.find(Game.class, Long.parseLong(idGame));
        
        if (game != null) { // Si el juego exite
            log.info("El juego existe");
            List<User> users = new ArrayList<>(game.getUsers());
            model.addAttribute("jugadores", users);
        } else {
            log.info("El juego no existe");
        }
        
        return "lobby";
    }
    
    @PostMapping("/leave")
    public String leaveLobby() {
        return "redirect:/user/";
    }
}
