import { IsNotEmpty, IsString } from "class-validator";

export class historyDetailDto {
    @IsNotEmpty()
    @IsString()
    place: string
    @IsNotEmpty()
    @IsString()
    date: string
}