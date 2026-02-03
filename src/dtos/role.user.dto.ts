import { IsArray, IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class RoleUserDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase alphanumeric with hyphens' })
    slug!: string;

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