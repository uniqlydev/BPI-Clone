class withdraw {

    private id: String;
    private bank: String;
    private amount: Number;

    constructor(id: String, bank: String, amount: Number) {
        this.id = id;
        this.bank = bank;
        this.amount = amount;
    }

    public getID(): String {
        return this.id;
    }

    public getBank(): String {
        return this.bank;
    }
    
    public getAmount(): Number {
        return this.amount;
    }
}

export default withdraw;