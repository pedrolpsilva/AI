import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class delNotificationDto {
    @IsNotEmpty()
    @IsNumber()
    id: number
}