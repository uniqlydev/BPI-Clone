import express, { Request, Response } from 'express';


interface RegisterRequest extends Request {
    body: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        confirm_password: string;
        phone_number: string;
    };

    file?: Express.Multer.File;
}

export default RegisterRequest;