import { IsEmail, IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class AssignAccessByEmailDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    role!: string;

    
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    custom_permissions?: string[];
}
