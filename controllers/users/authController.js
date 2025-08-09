import User from '../../model/userSchema.js';


export const registerUser = async(req, res) => {
  const {fullName, email, password} = req.body;

  try {
    
  } catch (error) {
    
  }
// add password strength validation


// confirmPassword
};

export const loginUser = async(req, res) => {
// Add rate limiting to prevent brute force
};

export const logoutUser = async(req, res) => {

};

export const verifyEmail = async(req, res) => {

};

export const resendVerification = async(req, res) => {

};

export const requestPasswordReset = async(req, res) => {

};

export const resetPassword = async(req, res) => {

};

export const refreshAccessToken = async(req, res) => {

};
