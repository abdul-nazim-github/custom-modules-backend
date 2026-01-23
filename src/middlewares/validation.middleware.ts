import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export const validateBody = (type: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const input = plainToInstance(type, req.body);
        const errors = await validate(input);

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed. Please check your input.',
                success: false
            });
        }

        req.body = input;
        next();
    };
};
