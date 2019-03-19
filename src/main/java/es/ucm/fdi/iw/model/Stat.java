package es.ucm.fdi.iw.model;

import javax.persistence.*;
import java.util.List;

/**
 */

@Entity
public class Stat {
	private long id;
	private String name;
	private String description;
	private String code;

	@OneToMany(mappedBy = "user")
	private List<User_Stat> user_stat;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
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

    public List<User_Stat> getUser_stat() {
        return user_stat;
    }

    public void setUser_stat(List<User_Stat> user_stat) {
        this.user_stat = user_stat;
    }
}
