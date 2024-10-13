import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { ProductInventory } from "./productInventory.entity";

@Entity('Product', { schema: 'Production' })
export class Product {
    @PrimaryColumn()
    ProductID: number;

    @Column({length: 50})
    Name: string;

    @Column({length: 55})
    ProductNumber: string;

    @Column()
    MakeFlag: boolean;

    @Column()
    FinishedGoodsFlag: boolean;

    @Column({ length: 15 })
    Color: string;

    @Column('decimal')
    SafetyStockLevel: number;

    @Column('decimal')
    ReorderPoint: number;

    @Column('decimal')
    StandardCost: number;

    @Column('decimal')
    ListPrice: number;

    @Column({ length: 5 })
    Size: string;

    @Column({ length: 3 })
    SizeUnitMeasureCode: string;

    @Column({ length: 3 })
    WeightUnitMeasureCode: string;

    @Column('decimal')
    Weight: number;

    @Column()
    DaysToManufacture: number;

    @Column({ length: 2 })
    ProductLine: string;

    @Column({ length: 2 })
    Class: string;

    @Column({ length: 2 })
    Style: string;

    @Column()
    ProductSubcategoryID: number;

    @Column()
    ProductModelID: number;

    @Column()
    SellStartDate: Date;

    @Column()
    SellEndDate: Date;

    @Column()
    DiscontinuedDate: Date;

    @Column('uuid')
    rowguid: string;

    @Column()
    ModifiedDate: Date;

    @JoinColumn({ name: 'ProductID', referencedColumnName: 'ProductID' })
    @OneToMany((type) => ProductInventory, (productInventory) => productInventory.product)
    productInventory: ProductInventory[];
}
