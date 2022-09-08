import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entities/user.entity"
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [ User ],
    synchronize: true,
    logging: false,
})

AppDataSource.initialize()
  .then( () => { console.log('DB connection established') })
  .catch( (error) => console.log(error) )