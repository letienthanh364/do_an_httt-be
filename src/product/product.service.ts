import { BadRequestException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Raw } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductInventory } from './entities/productInventory.entity';
import { dataSource } from 'ormconfig';
import { ProductCostHistory } from './entities/productCostHistory.entity';
import { PurchaseOrderDetail } from './entities/purchaseOrderDetail.entity';
import { WorkOrder } from './entities/workOrder.entity';
import { ProductListPriceHistory } from './entities/productListPriceHistory.entity';
import { ProductUtilsService } from './productUtils.service';

@Injectable()
export class ProductService {
  constructor(@InjectDataSource(dataSource) 
  private dataSource: DataSource,
  private readonly productUtilsService: ProductUtilsService
) {}

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
  async findAll() {
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
  async getProductWeightUnitMeasureCode(productId: number) {
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
  private generateRandomString(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }
  async createProduct(createProductDto: CreateProductDto): Promise<any> {
    const productRepository = this.dataSource.getRepository(Product);
    let generatedProductNumber = this.generateRandomString(20);

    let existingProduct = await productRepository.findOne({
      where: { ProductNumber: generatedProductNumber },
    });

      let existingName = await productRepository.findOne({
        where: { Name: createProductDto.Name },
      });
  
      while (existingProduct) {
        generatedProductNumber = this.generateRandomString(20);
        existingProduct = await productRepository.findOne({
          where: { ProductNumber: generatedProductNumber },
        });
      } 
      if (existingName)
      {
        throw new BadRequestException('The name of product already exists');
      }
  
      const newProduct = productRepository.create(
        {
          ...createProductDto,
          ProductNumber: generatedProductNumber
        });
     const product = await productRepository.save(newProduct);
      await this.productUtilsService.etlSingleProductSearch(product.ProductID);
      return product;
  }
  async deleteProduct(productId: number): Promise<void> {
    const productRepository = this.dataSource.getRepository(Product);
  
    // Find the product by ID
    const productToDelete = await productRepository.findOneByOrFail({ ProductID: productId });
  
    // Check if the product exists before deletion
    if (!productToDelete) {
      throw new NotFoundException('Product not found');
    }
  
    // Delete the product
    await productRepository.remove(productToDelete);
  }
}
