import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { PokemonModule } from '../pokemon/pokemon.module';
import { AxiosAdapter } from '../common/adapters/axios.adapter';

@Module({
  controllers: [SeedController],
  providers: [SeedService, PokemonModule, AxiosAdapter],
  imports: [PokemonModule]
})
export class SeedModule {}
