package es.ucm.fdi.iw.model;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;

/**
 */
@Entity
public class Game {
	
	private long id;
	private Date creationTime;
	private String status;
	private List<User> users = new ArrayList<>();

	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
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
	
	@ManyToMany(targetEntity = User.class, mappedBy = "games")
	List<User> getUsers(){
		return users;
	}
	
}
