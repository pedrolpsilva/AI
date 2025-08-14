import { IsNotEmpty, IsNumber } from "class-validator";

export class deleteDto {
    @IsNotEmpty()
    @IsNumber()
    id: number
}