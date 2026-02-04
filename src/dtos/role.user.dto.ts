import { IsArray, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RoleUserDto {
    @IsString()
    @IsNotEmpty()
    @IsNotEmpty()
    name!: string;

    @IsArray()
    @IsString({ each: true })
    permissions!: string[];
}

export class UpdateRoleUserDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    permissions?: string[];
}