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
import { PurchaseOrderDetail } from './entities/purchaseOrderDetail.entity';
import { WorkOrder } from './entities/workOrder.entity';
import { ProductListPriceHistory } from './entities/productListPriceHistory.entity';

@Injectable()
export class ProductService {
  constructor(@InjectDataSource(dataSource) private dataSource: DataSource) {}

  //Sort by QUANTITY DESC
  async findSortedByQuantity() {
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


  //DEFAULT SORT BY MODIFIED DATE DESC
  async findAll(){ 
    return await this.dataSource.manager.getRepository(Product).find({
      order: { ModifiedDate: 'DESC' },
    });
  }

  async findOne(ProductID: number): Promise<Product> {
    //TEST CONNECTION, REMOVE LATER
    return this.dataSource.manager.findOneBy(Product, { ProductID });
  }

  async listCostHistoryOfProduct(productId: number) {
    const productCostHistoryRepo =
      this.dataSource.getRepository(ProductCostHistory);
    return await productCostHistoryRepo.find({
      where: { product: { ProductID: productId } },
    });
  }

  async listPriceHistoryOfProduct(productId: number) {
    const productPriceHistoryRepo = this.dataSource.getRepository(
      ProductListPriceHistory,
    );
    return await productPriceHistoryRepo.find({
      where: { product: { ProductID: productId } },
    });
  }

  async listInventoriesByProductId(productId: number) {
    const productInventoryRepository =
      this.dataSource.getRepository(ProductInventory);

    const result = await productInventoryRepository.find({
      where: { ProductID: productId },
      relations: ['location'], // Join with the Location entity
      select: ['LocationID', 'Quantity', 'location'], // Select LocationID, Quantity, and Location details
    });

    return result.map((inventory) => ({
      location: inventory.location,
      quantity: inventory.Quantity,
    }));
  }

  async getProductStats(productId: number) {
    const workOrderRepo = this.dataSource.getRepository(WorkOrder);

    // Sum of OrderQuantity and StockedQuantity from PurchaseOrderDetail
    const productStats = await workOrderRepo
      .createQueryBuilder('workOrder')
      .select('SUM(workOrder.OrderQty)', 'orderQuantitySum')
      .addSelect('SUM(workOrder.StockedQty)', 'stockedQuantitySum')
      .addSelect('SUM(workOrder.ScrappedQty)', 'scrappedQuantitySum')
      .where('workOrder.ProductID = :productId', { productId })
      .getRawOne();

    return {
      orderQuantitySum: productStats.orderQuantitySum || 0,
      stockedQuantitySum: productStats.stockedQuantitySum || 0,
      scrappedQuantitySum: productStats.scrappedQuantitySum || 0,
    };
  }

  async getProductPurchaseStats(productId: number) {
    const purchaseOrderDetailRepo =
      this.dataSource.getRepository(PurchaseOrderDetail);

    // Sum of OrderQuantity and StockedQuantity from PurchaseOrderDetail
    const purchaseDetailStats = await purchaseOrderDetailRepo
      .createQueryBuilder('purchaseOrderDetail')
      .select('SUM(purchaseOrderDetail.ReceivedQty)', 'receivedQuantitySum')
      .addSelect('SUM(purchaseOrderDetail.RejectedQty)', 'rejectedQuantitySum')
      .addSelect('SUM(purchaseOrderDetail.StockedQty)', 'stockedQuantitySum')
      .where('purchaseOrderDetail.ProductID = :productId', { productId })
      .getRawOne();

    return {
      receivedQuantitySum: purchaseDetailStats.receivedQuantitySum || 0,
      rejectedQuantitySum: purchaseDetailStats.rejectedQuantitySum || 0,
      stockedQuantitySum: purchaseDetailStats.stockedQuantitySum || 0,
    };
  }
}
