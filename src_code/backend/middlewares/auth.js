/*const User = require('../models/user')

const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

// Checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies
    if (!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id);
     next()
})

// Handling users roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(`Role (${req.user.role}) is not allowed to acccess this resource`, 403))
        }
        next()
    }
}*/

const User = require('../models/user');
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

// Kiểm tra người dùng đã đăng nhập hay chưa
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        if (!req.user) {
            return next(new ErrorHandler('User not found.', 404));
        }
        next();
    } catch (error) {
        return next(new ErrorHandler('Invalid or expired token. Please login again.', 401));
    }
});

// Phân quyền người dùng
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource.`, 403)
            );
        }
        next();
    };
};
