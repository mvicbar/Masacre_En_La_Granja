package es.ucm.fdi.iw.model;

import javax.persistence.*;
import java.util.List;

/**
 */

@Entity
public class Stat {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
	private long id;
	
	private String name;
	private String description;
	private String code;

	@OneToMany(mappedBy = "stat")
	private List<User_Stat> user_stats;


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
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}

    public List<User_Stat> getUser_stats() {
        return user_stats;
    }

    public void setUser_stats(List<User_Stat> _user_stats) {
        this.user_stats = _user_stats;
    }
}
