class Deposit {

    private accountNumber: Number;
    private date: Date;
    private checkNumber: Number;

    constructor(accountNumber: Number,date: Date, checkNumber: Number) {
        this.accountNumber = accountNumber;
        this.date = date;
        this.checkNumber = checkNumber;
    }

    public getAccountNumber(): Number {
        return this.accountNumber;
    }

    public getDate(): Date {
        return this.date;
    }

    public getCheckNumber(): Number {
        return this.checkNumber;
    }

}
export default Deposit;