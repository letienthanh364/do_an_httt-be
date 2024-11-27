import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, getMongoRepository, ObjectId, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductSearch } from './entities/searchEntities/productSearch.entity';
import { v4 } from 'uuid';

@Injectable()
export class ProductUtilsService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Product, 'defaultConnection') // Specify SQL Server connection for Product
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductSearch, 'searchConnection') // MongoDB data source with specified connection name
    private readonly productSearchRepository: Repository<ProductSearch>,
  ) {}
  async onApplicationBootstrap() {
    await this.etlAllProductSeach();
    console.log('The Product Search Database is initialized successfully.');
  }

  transfromProductToProductSearch(product: Product): ProductSearch {
    // Helper function to safely extract search keys
    const getSearchKeysFromProduct = (product: Product): string[] => {
      const keys: (keyof Product)[] = [
        'Name',
        'ProductLine',
        'Class',
        'Color',
        'Style',
      ];
      return keys
        .map((key) => (product[key] != null ? String(product[key]) : undefined)) // Ensure product[key] is not null or undefined
        .filter((value) => value !== undefined) as string[]; // Filter out undefined values and cast to string[]
    };

    // Return a ProductSearch object with additional safety checks
    return {
      _id: v4(),
      ProductID: product.ProductID,
      ProductName: product.Name,
      ProductNumber: product.ProductNumber,
      Color: product.Color,
      ProductLine: product.ProductLine,
      Class: product.Class,
      Style: product.Style,
      StandardCost: product.StandardCost,
      SearchKeys: getSearchKeysFromProduct(product), // Extract and filter search keys
    };
  }

  async extractProductById(id: number) {
    return await this.productRepository.findOneBy({ ProductID: id });
  }

  async extractAllProducts() {
    const data = await this.productRepository.find({
      order: { ModifiedDate: 'DESC' },
    });
    return data;
  }

  async saveProductSearch(productSearch: ProductSearch) {
    try {
      // Check if a document with the same ProductID already exists
      const existingProductSearch = await this.productSearchRepository.findOne({
        where: { ProductID: productSearch.ProductID },
      });

      if (existingProductSearch) {
        // Check if there are any differences
        const isChanged =
          existingProductSearch.ProductName != productSearch.ProductName ||
          JSON.stringify(existingProductSearch.SearchKeys) !=
            JSON.stringify(productSearch.SearchKeys);

        if (isChanged) {
          // Update the existing document if there's a change
          await this.productSearchRepository.update(
            { ProductID: productSearch.ProductID },
            productSearch,
          );
        }
        return { message: 'ProductSearch updated', productSearch };
      } else {
        const newProductSearch =
          await this.productSearchRepository.save(productSearch);
        return {
          message: 'ProductSearch created',
          productSearch: newProductSearch,
        };
      }
    } catch (error) {
      console.error('Error saving productSearch:', error);
      throw new Error('Failed to save product search');
    }
  }

  async saveProductSearchList(productSearchList: ProductSearch[]) {
    return productSearchList.forEach(
      async (product) => await this.saveProductSearch(product),
    );
  }

  async etlSingleProductSearch(productId: number) {
    const product = await this.extractProductById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    try {
      const productSearch = this.transfromProductToProductSearch(product);
      return await this.saveProductSearch(productSearch);
    } catch (error) {
      console.error('Error transforming product to productSearch:', error);
      throw new Error('Failed to transform and save product search data.');
    }
  }

  async etlAllProductSeach() {
    const productList = await this.extractAllProducts();
    const productSearchList = productList.map((product) =>
      this.transfromProductToProductSearch(product),
    );
    return this.saveProductSearchList(productSearchList);
  }

  async searchProducts(keyword: string): Promise<ProductSearch[]> {
    const regex = new RegExp(keyword, 'i'); // Case-insensitive regex for MongoDB

    // Directly use the native MongoDB query with the repository
    return await this.productSearchRepository.find({
      where: {
        SearchKeys: { $regex: regex }, // Use MongoDB native $regex operator
      } as any, // TypeScript workaround to bypass TypeORM's type restrictions
    });
  }
}
