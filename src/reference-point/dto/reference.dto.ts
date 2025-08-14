import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class referenceDto {
    @IsNotEmpty()
    @IsNumber()
    id: number
}