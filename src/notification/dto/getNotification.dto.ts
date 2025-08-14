import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class getNotificationDto {
    @IsNotEmpty()
    @IsNumber()
    user: number
}