class billsPayment {

    private id: String;
    private biller: String;
    private accountNumber: Number;
    private accountName: String;
    private amount: Number;

    constructor(id: String, biller: String, accountNumber: Number,accountName: String,amount: Number) {
        this.id = id;
        this.biller = biller;
        this.accountNumber = accountNumber;
        this.accountName = accountName;
        this.amount = amount;
    }

    public getID(): String {
        return this.id;
    }

    public getBiller(): String {
        return this.biller;
    }

    public getAccountNumber(): Number {
        return this.accountNumber;
    }
    public getAccountName(): String {
        return this.accountName;
    }
    public getAmount(): Number {
        return this.amount;
    }
}

export default billsPayment;