package es.ucm.fdi.iw.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import javax.persistence.*;

/**
 */
@Entity
public class User_Stat implements Serializable {

	private Integer status;

	@EmbeddedId
	private User_StatId user_statId;
	
	@ManyToOne
	@MapsId("idUser")
	private User user;
	
	@ManyToOne
	@MapsId("idStat")
	private Stat stat;

	public User_Stat() {

	}
	
	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Stat getStat() {
		return stat;
	}

	public void setStat(Stat stat) {
		this.stat = stat;
	}

	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}
	
	
}
