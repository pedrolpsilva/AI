import { IsNotEmpty, IsString } from "class-validator";

export class versionDto {
    @IsNotEmpty()
    @IsString()
    os: string
    @IsNotEmpty()
    @IsString()
    deviceVersion: string
}