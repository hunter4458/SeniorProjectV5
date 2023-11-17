// user.js
class User {
    constructor(db) {
        this.collection = db.collection('users');
    }

    // Method to find user by email
    findByEmail(email) {
        return this.collection.findOne({ email: email });
    }

    // Method to add a new user
    addUser(user) {
        return this.collection.insertOne(user);
    }
}

module.exports = User;
