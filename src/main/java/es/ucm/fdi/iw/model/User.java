package es.ucm.fdi.iw.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.persistence.*;

/**
 * 
 */
@Entity
@NamedQueries({ @NamedQuery(name = "User.ByName", query = "SELECT u FROM User u WHERE u.name = :userName"),
		@NamedQuery(name = "User.HasName", query = "SELECT COUNT(u) FROM User u WHERE u.name = :userName"),
		@NamedQuery(name = "User.CorrectPassword", query = "SELECT u FROM User u WHERE u.name = :userName AND u.password = :userPassword"),
		@NamedQuery(name = "User.Password", query = "SELECT password FROM User u WHERE u.name = :userName")})
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
	private long id;

    @Column(unique = true)
	private String name;
 
	private String password;
	private String role;

	@ManyToMany
	private List<Game> games;

	@OneToMany
	@JoinColumn(name="user_id")
	private List<UserStat> userStats = new ArrayList<>();

	public User() {
	
	}
	
	public User(String _name) {
		name = _name;
	}
	
	public boolean hasRole(String roleName) {
		return Arrays.stream(role.split(",")).anyMatch(r -> r.equalsIgnoreCase(roleName));
	}
	
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}
	
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


	public List<Game> getGames() {
		return games;
	}

	public List<UserStat> getUserStats() {
		return userStats;
	}


	public void setUserStats(List<UserStat> userStats) {
		this.userStats = userStats;
	}


	public void setGames(List<Game> games) {
		this.games = games;
	}

}
