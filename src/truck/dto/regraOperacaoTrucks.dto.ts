import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class regraOperacaoTrucksDto{
    @IsNotEmpty()
    @IsArray()
    places: []
}