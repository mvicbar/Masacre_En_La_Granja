package es.ucm.fdi.iw.model;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;

import javax.persistence.*;

/**
 */
@Entity
public class Game {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
	private long id;
	private Date creationTime;
	private String password; // null si la partida no es privada
	
	@Column(length = 4096)
	private String status;

	@ManyToMany(mappedBy = "games")
	private List<User> users = new ArrayList<>();

	public Game(){}
	
	public boolean allowAccess(String _password) {
		return password.equals(_password);
	}
	
	public long getId() {
		return id;
	}
	
	public void setId(long id) {
		this.id = id;
	}
	
	public Date getCreationTime() {
		return creationTime;
	}
	
	public void setCreationTime(Date creation_time) {
		this.creationTime = creation_time;
	}
	
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
	public void setUsers(List<User> users) {
		this.users = users;
	}
	
	public List<User> getUsers(){
		return users;
	}
	
	public void addUser(User user) {
		users.add(user);
	}
	
	public void removeUser(User user) {
		users.remove(user);
	}
	
	public String getPassword() {
		return password;
	}
	
	public void setPassword(String password) {
		this.password = password;
	}
	
	public boolean equals(Object other) {
		return  other instanceof Game && id == ((Game) other).id;
	}
}
