import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    userId?: string;

    @IsArray()
    @IsString({ each: true })
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
    permissions?: string[];
}