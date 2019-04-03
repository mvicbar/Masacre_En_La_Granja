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
	private EntityManager entityManager;
	
	@Autowired
	private IwSocketHandler iwSocketHandler;

	@GetMapping("/")
	public String index(Model model) {
		Integer n1 = 1, n2 = 2;

		User u1 = entityManager.find(User.class, n1.longValue());
		User u2 = entityManager.find(User.class, n2.longValue());
		UserStat us1 = new UserStat();
		UserStat us2 = new UserStat();
		us1.setUser(u1);
		us2.setUser(u2);
		List<UserStat> all = new ArrayList<>();
		all.add(us1);
		all.add(us2);
		model.addAttribute("userStats", all);

		return "partida";
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

	@GetMapping("/chat")
	public String chat(Model model, HttpServletRequest request) {
		return "chat";
	}
	
	@GetMapping("/error")
	public String error(Model model) {
		return "error";
	}

}
