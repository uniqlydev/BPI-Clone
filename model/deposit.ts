class billsPayment {

    private id: String;
    private accountName: String;
    private accountNumber: Number;
    private date: Date;
    private checkNumber: String;
    private amount: Number;

    constructor(id: String, accountName: String, accountNumber: Number,date: Date, checkNumber: String, amount: Number) {
        this.id = id;
        this.accountName = accountName;
        this.accountNumber = accountNumber;
        this.date = date;
        this.checkNumber = checkNumber;
        this.amount = amount;
    }

    public getID(): String {
        return this.id;
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

    public getCheckNumber(): String {
        return this.checkNumber;
    }

    public getAmount(): Number {
        return this.amount;
    }
}

export default billsPayment;