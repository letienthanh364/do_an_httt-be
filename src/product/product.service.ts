import { Injectable, Param } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  Or,
  Raw,
  Repository,
} from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductInventory } from './entities/productInventory.entity';
import { dataSource } from 'ormconfig';
import { ProductCostHistory } from './entities/productCostHistory.entity';

@Injectable()
export class ProductService {
  constructor(@InjectDataSource(dataSource) private dataSource: DataSource) {}

  async findAll() {
    //Default sort by QUANTITY DESC
    return await this.dataSource.manager
      .createQueryBuilder(Product, 'product')
      .leftJoin(
        (subquery) => {
          return subquery
            .select('productInventory.ProductID', 'ProductId')
            .addSelect('SUM(productInventory.Quantity)', 'SumQuantity')
            .from(ProductInventory, 'productInventory')
            .groupBy('productInventory.ProductID');
        },
        'productQuantity',
        'product.ProductID = productQuantity.ProductID',
      )
      .addSelect('productQuantity.SumQuantity', 'SumQuantity')
      .orderBy('SumQuantity', 'DESC')
      .getRawMany(); //GET RAW IN CASE THE FINAL VALUE IS NOT AN ENTITY
  }

  async findBySubCatID(@Param('id') subcatID: number) {
    return await this.dataSource.manager.getRepository(Product).find({
      where: { ProductSubcategoryID: subcatID },
    });
  }

  async findByModelID(@Param('id') modelID: number) {
    return await this.dataSource.manager.getRepository(Product).find({
      where: { ProductModelID: modelID },
    });
  }

  async findActiveProducts() {
    const currentDate = new Date();
    return await this.dataSource.manager.getRepository(Product).findBy({
      SellStartDate: Raw((alias) => `${alias} <= :date`, { date: currentDate }),
      SellEndDate: Raw((alias) => `${alias} > GETDATE() OR ${alias} IS NULL`),
    });
  }

  async findByNewestDate() {
    return await this.dataSource.manager.getRepository(Product).find({
      order: { ModifiedDate: 'DESC' },
    });
  }

  async findOne(ProductID: number): Promise<Product> {
    //TEST CONNECTION, REMOVE LATER
    return this.dataSource.manager.findOneBy(Product, { ProductID });
  }

  async listCostHistoryOfProduct(productId: number) {
    const productCostHistoryRepository =
      this.dataSource.getRepository(ProductCostHistory);
    return await productCostHistoryRepository.find({
      where: { product: { ProductID: productId } },
    });
  }
}
