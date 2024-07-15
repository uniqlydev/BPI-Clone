class billsPayment {

    private id: String;
    private sender: Number;
    private accountName: String;
    private receiver: Number;
    private amount: Number;
    private description: String;

    constructor(id: String, sender: Number, accountName: String, receiver: Number, amount: Number, description: String) {
        this.id = id;
        this.sender = sender;
        this.accountName = accountName;
        this.receiver = receiver;
        this.amount = amount;
        this.description = description;
    }

    public getID(): String {
        return this.id;
    }

    public getSender(): Number {
        return this.sender;
    }

    public getAccountName(): String {
        return this.accountName;
    }

    public getReceiver(): Number {
        return this.receiver;
    }

    public getAmount(): Number {
        return this.amount;
    }

    public getDescription(): String {
        return this.description;
    }
}

export default billsPayment;