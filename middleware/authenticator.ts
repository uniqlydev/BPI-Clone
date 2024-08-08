import { Request, Response, NextFunction } from 'express';

const isAuthenticatedUser = (req: Request, res: Response, next: NextFunction) => {
    if (req.session?.user?.authenticated) {
        return next(); // User is authenticated, proceed to the next middleware or route handler
    } else {
        return res.status(401).json({ message: "Unauthorized" }); // User is not authenticated
    }
};

const isAuthenticatedAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.session?.user?.authenticated && req.session?.user?.userType === 'Admin') {
        return next(); // User is an admin, proceed to the next middleware or route handler
    } else {
        return res.status(401).json({ message: "Unauthorized" }); // User is not an admin
    }
}

export { isAuthenticatedUser, isAuthenticatedAdmin };
