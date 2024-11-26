import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/common/auth/strategy';
import { ProductInventory } from './entities/productInventory.entity';
import { dataSource } from 'ormconfig';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductInventory], dataSource),
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard, //ALL api in this module will be protected by jwt
    // }
  ],
})
export class ProductModule {}
