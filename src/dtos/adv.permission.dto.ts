import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    permissions?: string[];

    @IsOptional()
    metadata?: Record<string, any>;
}

export class UpdateRoleDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    permissions?: string[];

    @IsOptional()
    metadata?: Record<string, any>;
}
