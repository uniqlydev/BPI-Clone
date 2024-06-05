const uniqid = require('uniqid');

class IDGenerator {
    generateID() {
        return "user-" + uniqid();
    }
}

module.exports = IDGenerator; 
