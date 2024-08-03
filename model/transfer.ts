class transfer {

    private id: String;
    private sender: String;
    private accountName: String;
    private receiver: String;
    private amount: Number;
    private description: String;

    constructor(id: String, sender: String, accountName: String, receiver: String, amount: Number, description: String) {
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


    public getSender(): String {
        return this.sender;
    }

    public getReceiver(): String {
        return this.receiver;
    }

    public getAccountName(): String {
        return this.accountName;
    }

    public getAmount(): Number {
        return this.amount;
    }

    public getDescription(): String {
        return this.description;
    }
}

export default transfer;
