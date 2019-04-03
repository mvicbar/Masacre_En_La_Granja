package es.ucm.fdi.iw.control;

import es.ucm.fdi.iw.LocalData;
import es.ucm.fdi.iw.model.Game;
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

@Controller
@RequestMapping("lobby")
public class LobbyController {
    
    private static final Logger log = LogManager.getLogger(LobbyController.class);
    
    @Autowired
    private EntityManager entityManager;
    
    @Autowired
    private LocalData localData;
    
    @GetMapping("/newgame/{password}")
    public String newGame(Model model, HttpSession session,
                          @PathVariable String password) {
        
        return "redirect:/{" + idGame + "}";
    }
    
    @GetMapping("/{idGame}/{password}")
    public String getLobby(Model model, HttpSession session,
                           @PathVariable String idGame, @PathVariable String password) {
        
        Game game = entityManager.find(Game.class, Long.parseLong(idGame));
        
        if (game != null) { // Si el juego exite
            model.addAttribute("allowAccess", game.allowAccess(password));

            if(game.allowAccess(password)) { // Si la contraseña es válida
                model.addAttribute("jugadores", game.getUsers());
            }
        }
        
        return "lobby";
    }
    
    @PostMapping("/leave")
    public String leaveLobby() {
        return "redirect:/user/";
    }
}
