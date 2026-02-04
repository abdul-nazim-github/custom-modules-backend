import { IsEmail, IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class AssignAccessByEmailDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @Transform(({ value }: { value: any }) => Array.isArray(value) ? value : [value])
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    role!: string[];


    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    custom_permissions?: string[];
}
