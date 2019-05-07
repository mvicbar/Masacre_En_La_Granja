package es.ucm.fdi.iw.control;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.Mapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("game")
public class GameController {
    
    private static final Logger log = LogManager.getLogger(RootController.class);
    
    @Autowired
    private Environment env;
    
    @Autowired
    private IwSocketHandler iwSocketHandler;
    
    @GetMapping("/")
    public String play() {
        return "partida";
    }
    
}
