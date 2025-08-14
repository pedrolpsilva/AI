import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class historyPersonalityDto {
    @IsNotEmpty()
    @IsString()
    name?: string
    @IsNotEmpty()
    @IsString()
    command?: string
    @IsNotEmpty()
    @IsString()
    place?: string
}