enum TransactionType {
    D, // Deposit
    W, // Withdraw
    T // Transfer 
}

class Transaction {
    private _id: Number
    private _amount: Number
    private _type: TransactionType
    private _accountNumber: Number
    private _transferedTo: Number
    private _checkNum: Number 


    // Constructor for Deposit
    constructor(id: Number, amount: Number, type: TransactionType, accountNumber: Number, transferedTo: Number, checkNum: Number) {
        this._id = id
        this._amount = amount
        this._type = type
        this._accountNumber = accountNumber
        this._transferedTo = transferedTo
        this._checkNum = checkNum
    }
}