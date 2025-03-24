import { Request, Response, NextFunction } from 'express';

const isAuthenticatedUser = (req: Request, res: Response, next: NextFunction) => {
    if (req.session?.user?.authenticated && req.session?.user?.userType === 'user') {
        return next(); // User is authenticated, proceed to the next middleware or route handler
    } else {
        return res.status(401).json({ message: "Unauthorized" }); // User is not authenticated
    }
};

const isAuthenticatedAcctAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.session?.user?.authenticated && req.session?.user?.userType === 'acctad') {
        return next(); // User is an admin, proceed to the next middleware or route handler
    } else {
        return res.status(401).json({ message: "Unauthorized" }); // User is not an admin
    }
}

const isAuthenticatedTransacAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.session?.user?.authenticated && req.session?.user?.userType === 'transacad') {
        return next(); // User is an admin, proceed to the next middleware or route handler
    } else {
        return res.status(401).json({ message: "Unauthorized" }); // User is not an admin
    }
}



const isAuthenticatedOTP = (req: Request, res: Response, next: NextFunction) => {
    if (req.session?.user?.otp && req.session.user.otp !== '') {
        return next(); // OTP exists and is not an empty string, proceed
    } else {
        return res.status(401).json({ message: "Unauthorized" }); // OTP is missing or empty
    }
};

export { isAuthenticatedUser, isAuthenticatedTransacAdmin, isAuthenticatedAcctAdmin, isAuthenticatedOTP };
