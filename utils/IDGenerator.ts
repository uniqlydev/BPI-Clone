const uniqid = require('uniqid');

class IDGenerator {
    public generateID():String {
        return "user-" + uniqid();
    }
}

module.exports = IDGenerator; 
