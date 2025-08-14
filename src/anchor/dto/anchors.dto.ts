import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class anchorsDto {
    @IsNotEmpty()
    @IsString()
    places: string
}