import { IsInt, IsPositive, IsString, Min, MinLength } from "class-validator";
export class CreatePokemonDto {

    // Entero, positive, min 1
    @IsInt()
    @IsPositive()
    @Min(1)
    no: number;

    // String, min leng 1
    @IsString()
    @MinLength(1)
    name: string;
}
