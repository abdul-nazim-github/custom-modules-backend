import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import type { Request, Response, NextFunction } from 'express';

export const validateBody = (dtoClass: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const instance = plainToInstance(dtoClass, req.body);
        const errors = await validate(instance, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });

        if (errors.length > 0) {
            const message = errors
                .map((error: ValidationError) => Object.values(error.constraints || {}))
                .flat()
                .join(', ');

            return res.status(400).json({
                message,
                success: false,
            });
        }

        req.body = instance;
        next();
    };
};
