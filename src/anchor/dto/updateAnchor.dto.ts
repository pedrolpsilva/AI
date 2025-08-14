import { IsNotEmpty, IsNumber } from "class-validator";

export class updateAnchorDto {
    @IsNotEmpty()
    @IsNumber()
    id: number
}