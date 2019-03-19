package es.ucm.fdi.iw.model;

import java.io.Serializable;

import javax.persistence.Embeddable;

@Embeddable
public class User_StatId implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 0;
	private Integer idUser;
	private Integer idStat;
	
	public User_StatId() {
	}
	
	public User_StatId(Integer idUser, Integer idStat) {
		this.idStat = idStat;
		this.idUser = idUser;
	}
	
	//to do
	public boolean equals(Object obj) {
		return false;
	}
	
	public int hashCode() {
		return 0;
	}
}
