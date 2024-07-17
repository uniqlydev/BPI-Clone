class withdraw {

    private accountNum: String;
    private amount: Number;

    constructor(accountNum: String, amount: Number) {
        this.accountNum = accountNum;
        this.amount = amount;
    }

    public getAccountNum(): String {
        return this.accountNum;
    }

    public getAmount(): Number {
        return this.amount;
    }
}

export default withdraw;