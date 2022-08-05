import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MatchedDataClass } from "./matched-data-class";
import { RestMethod } from "../src/enums";
import { OpenApiSpec } from "./openapi-spec";

@Entity()
export class ApiEndpoint extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  uuid: string

  @Column({ nullable: false })
  path: string

  @Column({ nullable: false })
  pathRegex: string

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date

  @Column({ nullable: false })
  host: string

  @Column({ type: "integer", default: 0})
  totalCalls: number

  @Column({ type: "enum", enum: RestMethod})
  method: RestMethod

  @Column({ nullable: true })
  owner: string

  @OneToMany(() => MatchedDataClass, dataClass => dataClass.apiEndpoint)
  sensitiveDataClasses: MatchedDataClass[]

  @Column({ nullable: true })
  openapiSpecName: string

  @ManyToOne(() => OpenApiSpec)
  @JoinColumn()
  openapiSpec: OpenApiSpec
}
