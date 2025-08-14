import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class getNotificationPlaceDto {
    @IsNotEmpty()
    @IsNumber()
    user: number
    @IsNotEmpty()
    @IsString()
    place: string
}