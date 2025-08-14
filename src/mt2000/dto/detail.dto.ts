import { IsNotEmpty, IsString } from "class-validator";

export class detailDto {
    @IsNotEmpty()
    @IsString()
    place: string
}