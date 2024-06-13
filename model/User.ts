class User {

    private id: String;
    private first_name: String;
    private last_name: String;
    private email: String;
    private password: String;
    private phone: String;
    private profile_picture: String;
    private role: string;

    constructor(id: String,first_name: String,last_name: String,email: String,password: String,phone: String, profile_picture: String) {
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.profile_picture = profile_picture;
        this.role = "user"
    }

    public getID(): String {
        return this.id;
    }

    public getFirstName(): String {
        return this.first_name;
    }

    public getLastName(): String {
        return this.last_name;
    }

    public getEmail(): String {
        return this.email;
    }

    public getPassword(): String {
        return this.password;
    }

    public getPhone(): String {
        return this.phone;
    }

    public getRole(): String {
        return this.role;
    }

    public getProfilePicture(): String {
        return this.profile_picture;
    }
}

export default User;