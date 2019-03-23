package es.ucm.fdi.iw.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.persistence.*;

/**
 * 
 */
@Entity
@NamedQueries({ @NamedQuery(name = "User.ByName", query = "SELECT u FROM User u " + "WHERE u.name = :userName"),
		@NamedQuery(name = "User.HasName", query = "SELECT COUNT(u) " + "FROM User u " + "WHERE u.name = :userName") })
public class User {
	private long id;

	private String name;
	private String password;
	private String role;
	private List<Game> games;

	@OneToMany(mappedBy = "user")
	private List<User_Stat> user_stats = new ArrayList<>();

	public boolean hasRole(String roleName) {
		String requested = roleName.toLowerCase();
		return Arrays.stream(role.split(",")).anyMatch(r -> r.equals(requested));
	}

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	@Column(unique = true)
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}


	@Override
	public String toString() {
		return "User [id=" + id + ", login=" + name + ", password=" + password + ", roles=" + role + "]";
	}

	public void setUser_stats(List<User_Stat> user_stats) {
		this.user_stats = user_stats;
	}

	@OneToMany(targetEntity = Stat.class)
	List<User_Stat> getUser_Stats() {
		return user_stats;
	}

	@ManyToMany(targetEntity = Game.class)
	public List<Game> getGames() {
		return games;
	}

	public void setGames(List<Game> games) {
		this.games = games;
	}

}
