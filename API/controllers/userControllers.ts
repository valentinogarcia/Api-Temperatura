
import {dbPromise,DB_CONN_STRING,DB_NAME,COLLECTION_NAME,ConvertColectionToPais,ConvertDocumentToPais,getPais,findPais,findCiudad,findProvincia,collections} from '../utilities/DataBaseFunctions/DBFunctions'
import { calcGlobalSUM,getDegrees } from '../utilities/Degrees/DegreeCalculations';
import * as mongoDB from "mongodb";
import { log } from 'console';
import { user } from '../models/user';
import { hashear, conectUserDataBase, insertUser, confirm } from '../utilities/DataBaseFunctions/userFunctions'

export default {
    userRegister: (async (_req,_res)=> {   
        
    }),

    userLogin: (async (_req,_res)=> {   
        
    })
}  