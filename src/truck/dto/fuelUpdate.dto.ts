import { IsNotEmpty, IsString } from "class-validator";

export class fuelUpdateDto {
    @IsNotEmpty()
    @IsString()
    place: string
    @IsNotEmpty()
    @IsString()
    type: string
    @IsNotEmpty()
    @IsString()
    value: string
    @IsNotEmpty()
    @IsString()
    km: string
}