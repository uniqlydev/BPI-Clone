import express, { Request, Response } from 'express';

interface LoginRequest extends Request {
    body: {
        email: string;
        password: string;
    };
}

export default LoginRequest;