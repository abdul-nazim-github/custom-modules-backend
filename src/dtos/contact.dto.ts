import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ContactDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString()
    @MaxLength(50)
    name!: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    email!: string;

    @IsNotEmpty({ message: 'Subject is required' })
    @IsString({ message: 'Subject must be a string' })
    @MaxLength(200)
    subject!: string;

    @IsNotEmpty({ message: 'Message is required' })
    @IsString({ message: 'Message must be a string' })
    message!: string;
}