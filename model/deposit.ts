class Deposit {

    private accountName: String;
    private accountNumber: Number;
    private date: Date;
    private checkNumber: Number;

    constructor(accountName: String, accountNumber: Number,date: Date, checkNumber: Number) {
        this.accountName = accountName;
        this.accountNumber = accountNumber;
        this.date = date;
        this.checkNumber = checkNumber;
    }


    public getAccountName(): String {
        return this.accountName;
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