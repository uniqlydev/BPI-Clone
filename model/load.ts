class billsPayment {

    private id: String;
    private network: String;
    private mobileNum: Number;
    private amount: Number;

    constructor(id: String, network: String, mobileNum: Number,amount: Number) {
        this.id = id;
        this.network = network;
        this.mobileNum = mobileNum;
        this.amount = amount;
    }

    public getID(): String {
        return this.id;
    }

    public getNetwork(): String {
        return this.network;
    }

    public getMobileNum(): Number {
        return this.mobileNum;
    }

    public getAmount(): Number {
        return this.amount;
    }
    
}

export default billsPayment;