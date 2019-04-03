package es.ucm.fdi.iw.control;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;

import es.ucm.fdi.iw.model.User;
import es.ucm.fdi.iw.model.UserStat;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class RootController {
	
	private static final Logger log = LogManager.getLogger(RootController.class);
	
	@Autowired
	private Environment env;
	
	@Autowired
	private IwSocketHandler iwSocketHandler;

	@GetMapping("/")
	public String index(Model model) {
		return "iniciosesion";
	}
	
	@GetMapping("/reglas")
	public String rules(Model model) {
		return "reglas";
	}
	
	@GetMapping("/faq")
	public String faq(Model model) {
		return "faq";
	}
	
	@GetMapping("/estadisticas")
	public String globalStats(Model model) {
		return "estadisticas-globales";
	}
	
	@GetMapping("/admin")
	public String admin(Model model, Principal principal) {
		model.addAttribute("activeProfiles", env.getActiveProfiles());
		model.addAttribute("basePath", env.getProperty("es.ucm.fdi.base-path"));
		
		log.info("let us all welcome this admin, {}", principal.getName());
		
		return "index";
	}
}
