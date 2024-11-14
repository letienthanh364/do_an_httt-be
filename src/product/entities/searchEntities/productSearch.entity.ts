import { Column, Entity, ObjectIdColumn, ObjectId, Index } from 'typeorm';

@Entity('ProductSearch')
export class ProductSearch {
  @ObjectIdColumn() // Primary key for MongoDB
  _id: string;

  @Column()
  @Index({ unique: true }) // Ensures ProductID is unique within the collection
  ProductID: number;

  @Column({ length: 50 })
  ProductName: string;

  @Column()
  ProductNumber: string;

  @Column()
  Color: string;

  @Column()
  ProductLine: string;

  @Column()
  Class: string;

  @Column()
  Style: string;

  @Column()
  StandardCost: number;

  @Column('array') // MongoDB-compatible array type
  SearchKeys: string[];
}
