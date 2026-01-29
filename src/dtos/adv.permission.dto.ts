import { IsString, IsNotEmpty, IsArray, IsOptional, Matches } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    userId?: string;

    @IsArray()
    @IsString({ each: true })
    @Matches(/^[a-z]+(\.[a-z]+)*\.(view|create|edit|delete)$/i, {
        each: true,
        message: 'Invalid permission format'
    })
    permissions!: string[];
}

export class UpdateRoleDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    userId?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Matches(/^[a-z]+(\.[a-z]+)*\.(view|create|edit|delete)$/i, {
        each: true,
        message: 'Invalid permission format'
    })
    permissions?: string[];
}