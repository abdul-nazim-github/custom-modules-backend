import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ContactDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString()
    @MaxLength(100)
    name!: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    email!: string;

    @IsNotEmpty({ message: 'Subject is required' })
    @IsString()
    @MaxLength(200)
    subject!: string;

    @IsNotEmpty({ message: 'Message is required' })
    @IsString()
    @MinLength(10, { message: 'Message must be at least 10 characters long' })
    @MaxLength(2000)
    message!: string;
}
