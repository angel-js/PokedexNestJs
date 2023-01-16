import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto,  UpdatePokemonDto } from './dto';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name ) // Es necesario para que funcione todo esto se importa de Mongoose
    private readonly PokemonModel: Model<Pokemon> // Este modelo no es un Provider
  ) {}

  private pokemones: Pokemon[] = [];

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.PokemonModel.create( createPokemonDto );
      return pokemon;

    } catch (error) {
      this.handleException(error);
    }

  }

  findAll( paginationDto: PaginationDto ) {

    const { limit = 10, offset = 0 } = paginationDto;

    return this.PokemonModel.find()
    .limit( limit )
    .skip( offset )
    .sort({
      no: 1
    })
    .select('-__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    // Busqueda por no
    if ( !isNaN(+term) ) {
      pokemon = await this.PokemonModel.findOne({no: term })
    }

    // Busqueda por Mongo Id
    if ( !pokemon && isValidObjectId( term ) ){
      pokemon = await this.PokemonModel.findById( term );
    }
    
    // Busqueda por Name
    if ( !pokemon ){
      pokemon = await this.PokemonModel.findOne({ name: term.toLowerCase().trim() })
    }


    // Error si lo que ingresa no es correcto
    if ( !pokemon ){
      throw new NotFoundException(`Pokemon "${term}" not found in DataBase`)
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term );
    if( updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    try{
        await pokemon.updateOne( updatePokemonDto)
        return {...pokemon.toJSON(), ...updatePokemonDto};
    } catch (error) {
      this.handleException(error);
    }
      

  }

  async remove(id: string) {
  // const pokemon = await this.findOne( id ); 
  //  await pokemon.deleteOne();
  // return { id }; 
  // const result = this.PokemonModel.findByIdAndDelete( id );
    const { deletedCount } = await this.PokemonModel.deleteOne({ _id: id });
if ( deletedCount == 0 ){
  throw new BadRequestException(`Pokemon with id "${ id }" not found`);
}

  return;
}

  private handleException( error: any ){
    if ( error.code === 11000){
      throw new BadRequestException(`Pokemon already exists in DataBase ${ JSON.stringify( error.keyValue )}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can´t create Pokemon - Check server logs`);
  }
}
  