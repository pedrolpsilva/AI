import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class positionDto {
    @IsNotEmpty()
    @IsNumber()
    profile: number
    @IsOptional()
    @IsNumber()
    user: number
    @IsOptional()
    @IsString()
    client: string
}