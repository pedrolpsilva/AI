import { IsNotEmpty, IsString } from "class-validator";

export class fuelDto {
    @IsNotEmpty()
    @IsString()
    place: string
}