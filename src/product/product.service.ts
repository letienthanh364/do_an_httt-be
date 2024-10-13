import { Injectable, Param } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductInventory } from './entities/productInventory.entity';
import { dataSource } from 'ormconfig';

@Injectable()
export class ProductService {
  constructor(
    @InjectDataSource(dataSource) private dataSource: DataSource,
  ) {}

  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  async findAll(): Promise<Product[]> {
    return this.dataSource.manager.find(Product);
  }

  async findOne(ProductID: number): Promise<Product> {//TEST CONNECTION, REMOVE LATER
    return this.dataSource.manager.findOneBy(Product, {ProductID});
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
