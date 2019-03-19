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

        return obj instanceof User_StatId &&
                idUser.equals(((User_StatId) obj).idUser) &&
                idStat.equals(((User_StatId) obj).idStat);

    }
	
	public int hashCode() {
		return 2 * idStat + 3 * idUser;
	}

    public Integer getIdUser() {
        return idUser;
    }

    public void setIdUser(Integer idUser) {
        this.idUser = idUser;
    }

    public Integer getIdStat() {
        return idStat;
    }

    public void setIdStat(Integer idStat) {
        this.idStat = idStat;
    }
}
