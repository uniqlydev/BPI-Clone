class mfa {

    private id: number;
    private email: String;
    private code: String;
    private expires_at: Date;
    private used_at: Date;
    private created_at: Date;

    constructor(id: number, email: String, code: String, expires_at: Date, used_at: Date, created_at: Date) {
        this.id = id;
        this.email = email;
        this.code = code;
        this.expires_at = expires_at;
        this.used_at = used_at;
        this.created_at = created_at;
    }

    public getID(): number {
        return this.id;
    }

    public getEmail(): String {
        return this.email;
    }

    public getCode(): String {
        return this.code;
    }

    public getExpires_at(): Date {
        return this.expires_at;
    }

    public getUsed_at(): Date {
        return this.used_at;
    }

    public getCreated_at(): Date {
        return this.created_at;
    }
}

export default mfa;