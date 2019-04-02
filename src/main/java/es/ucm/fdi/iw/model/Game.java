package es.ucm.fdi.iw.model;

import java.sql.Date;
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
	private LinkedHashSet<User> users = new LinkedHashSet<>();

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
	
	public void setUsers(LinkedHashSet<User> users) {
		this.users = users;
	}
	
	public LinkedHashSet<User> getUsers(){
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
}
