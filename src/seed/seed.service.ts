import { Injectable } from '@nestjs/common';
import { PokeResponse, Pokemon } from '../../dist/pokemon/interfaces/poke-response.interface';
// Mongoose
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(

    @InjectModel( Pokemon.name ) // Es necesario para que funcione todo esto se importa de Mongoose
    private readonly PokemonModel: Model<Pokemon>, // Este modelo no es un Provider
  
    private readonly http: AxiosAdapter
    ) {}

   async executeSeed(){

    await this.PokemonModel.deleteMany({});

    const  data  = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=30')
    
    const pokemonToInsert: { name: string , no: number}[] = [];
    
    data.results.forEach( ( { name, url } ) => {
      //console.log(name, url)
      const segments = url.split('/');
      const no = +segments[ segments.length -2]
      console.log({name, no})
      
      //const pokemon = await this.PokemonModel.create( { name, no} );
      pokemonToInsert.push( { name, no } );// [{name: bulbasaur, no:1}]

      });

    await this.PokemonModel.insertMany(pokemonToInsert);

    return 'Seed Executed';
  }
}
