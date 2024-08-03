class Deposit {

    private email: String;
    private date: Date;
    private checkNumber: Number;

    constructor(email: String,date: Date, checkNumber: Number) {
        this.email = email;
        this.date = date;
        this.checkNumber = checkNumber;
    }

    public getEmail(): String {
        return this.email;
    }

    public getDate(): Date {
        return this.date;
    }

    public getCheckNumber(): Number {
        return this.checkNumber;
    }

}
export default Deposit;
