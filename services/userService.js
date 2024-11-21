// services/userService.js
const UserModel = require('../models/user.module');

const updateUserWithBlueTick = async () => {
    try {
        const result = await UserModel.updateOne(
            { 
                email: /.+@nsut\.ac\.in$/, // Match any characters before @nsut.ac.in
                isVerified: true // Check if the user is verified
            }, 
            { $set: { blueTick: true } } // Set blueTick to true for that user
        );

        if (result.modifiedCount > 0) {
            console.log('Successfully updated user with blue tick.');
            return { success: true, message: 'User updated with blue tick.' };
        } else {
            console.log('No user found or already updated.');
            return { success: false, message: 'No user found or blue tick already set.' };
        }
    } catch (error) {
        console.error('Error updating user with blue tick:', error);
        return { success: false, message: 'An error occurred while updating the user.' };
    }
    next()
};

module.exports = { updateUserWithBlueTick };
