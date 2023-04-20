
import { ObjectId } from 'mongodb';
import * as mongoDB from "mongodb";
import { Ciudad } from './Ciudad';
import { Pais } from './Pais';
import { Provincia } from './Provincia';
import { Tiempo } from './Tiempo';
import express, { json } from 'express';


const DB_CONN_STRING="mongodb://localhost:27017"
const DB_NAME="BaseDeTemperaturas"
const COLLECTION_NAME="paises"

const app = express();

const port = 3000


app.use(express.json());

import swaggerDocs from './swagger';
function genCiudad(t1:number,t2:number,t3:number) {
let fecha = new Date()
fecha.setMonth(3)
fecha.setFullYear(2023)
fecha.setDate(10)
let genTiempo       = new Tiempo( fecha,t1 )
let tiempos         = new Array<Tiempo>
tiempos.push(genTiempo)
fecha.setDate(20)
fecha.setHours(10)
genTiempo= new Tiempo( fecha,t2 )
tiempos.push( genTiempo )
fecha.setDate(4)
genTiempo=new Tiempo(fecha,t3)
tiempos.push( genTiempo )
return tiempos
}


const collections: { paises?: mongoDB.Collection } = {}

async function findPais(paises:Pais[],target:string) {
 return paises.find( (pais)=> pais.nombre.toLowerCase() === target.toLocaleLowerCase() )
}
async function ConvertColectionToPais(db:mongoDB.Db): Promise<Pais[]> {
  const col = await db.collection("paises").find().toArray();
  let paises:Pais[]=[]
  col.forEach( (obj)=>{ const pais:Pais = new Pais(obj.nombre,obj.provincias);paises.push(pais) } )
  return paises
}

async function findCiudad(provincia:Provincia,target:string) {
  return provincia.ciudades.find( (ciudad)=> ciudad.nombre.toLowerCase()===target.toLowerCase() )
}

async function findProvincia(pais:Pais,target:string) {
  return pais.provincias.find( ( provincia ) => provincia.nombre.toLowerCase()===target.toLowerCase() )  
}


async function main() {

  async function connectToDatabase () {
    // dotenv.config();
  
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(DB_CONN_STRING);
            
    await client.connect();
    
    const db: mongoDB.Db = client.db(DB_NAME);
    const paisesCollection: mongoDB.Collection = db.collection(COLLECTION_NAME);
    collections.paises = paisesCollection;
       
    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${paisesCollection.collectionName}`);
    return db;
  }

  const db: mongoDB.Db = await connectToDatabase()
  app.get( '/paises', async (_req,_res)=> 
    { _res.status(200).send(await ConvertColectionToPais(db)) }
  )


/** 
* @openapi
* paths:
*   /paises/{pais}:
*     patch:
*       parameters:
*         - in: path
*           name: pais
*           schema:
*             type: string
*             default: Argentina
*           required: true
*       tags: 
*         - patch
*       summary: Reemplaza los datos del pais por los valores que no sean undefined o false del body
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*                $ref: '#/components/schemas/Pais'
*           
*       responses:
*         200:
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Pais'
*/

  app.patch( '/paises/:pais/', async (_req,_res)=> {
  /*
  const paises = ConvertColectionToPais( db )
  ; const objetivo =  (await paises).find( (pais)=> pais.nombre === _req.params.pais )
  _res.status(200).send(objetivo)   */
  
  
    const pais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLocaleLowerCase())
    console.log( pais )
    if (pais){
      //const provincia = pais.provincias.find( (element)=> element.nombre==_req.params.provincia)
        
      if(_req.body.nombre  ) {
        paises[paises.indexOf(pais)].nombre = _req.body.nombre;
      }
      console.log( _req.body.provincias )
      if(_req.body.provincias==false || _req.body.provincias==undefined) {console.log("true");paises[paises.indexOf(pais)].provincias = _req.body.provincias;} 
      return _res.send(  "Patcheado exitosamente ponele" )    
    }
  })

  async function calcGlobalSUM(grados:Array<number>)  {
    if(grados.length<=0){return false}
    let promedio:number  ; 
    grados.forEach( (celsius)=> { if(!promedio){promedio=celsius.valueOf()}else{promedio=promedio.valueOf()+celsius.valueOf() }  }  )
    return promedio!
  }
  async function getDegrees(  ) {
    let grados:Array<number> = new Array<number>  
    paises.forEach( (x)=>{x!.provincias.forEach( (provincia) => { provincia.ciudades.forEach( ( c )=>{ c.registroDeTemperatura.forEach( (regis)=>{ grados.push(regis.grados) } ) } ) }  )
      if(!x) { return false} 
    })
    return grados
  }
     
  app.get( '/temperaturaPromedio/', async (_req,_res) => {
    const grados = await getDegrees()
    const promedio = await calcGlobalSUM( grados )
    if(promedio) { return _res.json({ "promedio" : promedio.valueOf()/grados.length}) }return _res.sendStatus(400)
  })
     


//function findnombre(nombre:string,object:object){ const p = paises.find((pa) => pa.nombre.toLowerCase() === nombre) }

let ciudades:Array<Ciudad> = new Array<Ciudad>
let gciudad= new Ciudad("CABA", [  (new Tiempo( new Date() , 30) ), (new Tiempo( new Date() , 32) ),(new Tiempo(new Date(),36) ) ] )

ciudades.push(gciudad )
gciudad= new Ciudad("Pueyrredon", [  (new Tiempo( new Date() , 10) ), (new Tiempo( new Date() , 20) ),(new Tiempo(new Date(),16) ) ] )
ciudades.push(gciudad )

let provins = new Array<Provincia>
let genprovincia = new Provincia("BSAS",ciudades)
provins.push(genprovincia)

ciudades = new Array<Ciudad>
gciudad= new Ciudad("CiudadDeCordoba", [  (new Tiempo( new Date() , 10) ), (new Tiempo( new Date() , 20) ),(new Tiempo(new Date(),16) ) ] )
ciudades = new Array<Ciudad>
gciudad= new Ciudad("Cosquin", [  (new Tiempo( new Date() , 10) ), (new Tiempo( new Date() , 20) ),(new Tiempo(new Date(),16) ) ] )
ciudades.push(gciudad)
genprovincia = new Provincia("Cordoba",ciudades)
provins.push(genprovincia)
let paises = new Array<Pais>
paises.push(new Pais("Argentina",provins))

/** 
 * @openapi
 * components:
 *  schemas:
 *    Ciudad:
 *      type: object
 *      required:
 *        -nombre
 *        -registroDeTemperatura
 *      properties:
 *        nombre:
 *          type: string
 *          default:  tiananmensquare
 *        registroDeTemperatura:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/Tiempo'
 *    Tiempo:
 *      type: object
 *      required:
 *        -fecha
 *        -grados
 *      properties:
 *        fecha:
 *          type: string
 *          default:  tiananmensquare
 *        grados:
 *          type: number
 *    Provincia:
 *      type: object
 *      required:
 *        -nombre
 *        -ciudades
 *      properties:
 *        nombre:
 *          type: string
 *          default:  BSAS
 *        ciudades:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/Ciudad'
 *    Pais:
 *      type: object
 *      required:
 *        -nombre
 *        -provincias
 *      properties:
 *        nombre:
 *          type: string
 *          default:  Argentina
 *        provincias:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/Provincia'
 *        
 *        
 */


/*
const p = paises.find((pa) => pa.nombre === _req.params.pais)
    console.log( p )
    if (p){
        delete paises[paises.indexOf(p)]
      }
      _res.status(204).send()
*/




/** 
* @openapi
* paths:
*   /paises/{pais}:
*     put:
*       parameters:
*         - in: path
*           name: pais
*           schema:
*             type: string
*             default: Argentina
*           required: true
*       tags: 
*         - put
*       summary: Reemplaza todos los valores del pais por los recibidos
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*                $ref: '#/components/schemas/Pais'
*           
*       responses:
*         200:
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Pais'
*/

app.put("/paises/:pais", async (_req, _res) => {
  try {
      const paisAct: Pais = _req.body as Pais;
      //const query = { _id: new ObjectId(id) };

      //const r = await collections.paises?.deleteOne( { nombre: _req.body.nombre } );

      const r = await collections.paises?.updateOne(_req.body.nombre, { $set: paisAct });

      r
          ? _res.status(200).send(`Se actualizo yyreeeiiii!!!`)
          : _res.status(304).send(`No existe....`);
  } catch (error) {
      _res.status(400).send("el que dice error es puto");
  }
});

app.put( '/paises/:pais', (_req,_res)=> {
  const p = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  console.log( p )
  if (p){
    paises[paises.indexOf(p)] =_req.body
    return _res.send(  "Putteado exitosamente ponele" )   
  }
  _res.sendStatus(400)    
})

 /** 
* @openapi
* paths:
*   /paises/{pais}/{provincia}:
*     put:
*       parameters:
*         - in: path
*           name: pais
*           schema:
*             type: string
*             default: Argentina
*           required: true
*         - in: path
*           name: provincia
*           schema:
*             type: string
*             default: Pueyrredon
*           required: true
*       tags: 
*         - put
*       summary: Reemplaza todos los datos de la provincia por los del body
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*                $ref: '#/components/schemas/Provincia'
*           
*       responses:
*         200:
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Provincia'
*/


app.put( '/paises/:pais/provincias/:provincia', (_req,_res)=> {
  const p = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  console.log( p )
  if (p){
    const provincia = paises[paises.indexOf(p)].provincias.find((pa) => pa.nombre.toLowerCase() === _req.params.provincia.toLowerCase()  )
    if(!provincia){ return _res.sendStatus(400) }
    const x = paises[paises.indexOf(p)].provincias.indexOf( provincia )
    paises[paises.indexOf(p)].provincias[ x ] =_req.body
    return _res.send(  "Putteado exitosamente ponele" )   
  }
  _res.sendStatus(400)    
})

 /** 
* @openapi
* paths:
*   /paises/{pais}/{provincia}/{ciudad}:
*     put:
*       parameters:
*         - in: path
*           name: pais
*         - in: path
*           name: provincia
*         - in: path
*           name: ciudad
*       tags: 
*         - put
*       summary: Reemplaza todos los datos de la ciudad por los del body
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*                $ref: '#/components/schemas/Ciudad'
*           
*       responses:
*         200:
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Ciudad'
*/

app.put( '/paises/:pais/provincias/:provincia/ciudades/:ciudad', (_req,_res)=> {
  const p = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  console.log( p )
  if (p){
    const provincia = paises[paises.indexOf(p)].provincias.find((pa) => pa.nombre.toLowerCase() === _req.params.provincia.toLowerCase()  )
    if(!provincia){ return _res.sendStatus(400) }
    const v = paises.indexOf(p)
    const x = paises[v].provincias.indexOf(provincia)
    const y = paises[v].provincias.find( (pa) => pa.nombre.toLowerCase() === _req.params.ciudad.toLowerCase() )
    paises[v].provincias[ x ].ciudades =_req.body;    return _res.send(  "Putteado exitosamente ponele" )       
  }
  _res.sendStatus(  400 )    
})

/** 
* @openapi
* paths:
*   /paises/{pais}/{provincia}:
*     patch:
*       parameters:
*         - in: path
*           name: pais
*           schema:
*             type: string
*             default: Argentina
*           required: true
*         - in: path
*           name: provincia
*           schema:
*             type: string
*             default: Pueyrredon
*           required: true
*       tags: 
*         - patch
*       summary:  Reepmlaza los datos de la provincia por los datos que no sean undefined o false del body
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*                $ref: '#/components/schemas/Provincia'
*           
*       responses:
*         200:
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Provincia'
*/

 
app.patch( '/paises/:pais/provincias/:provincia', (_req,_res)=> {
  const pais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  console.log( pais )
  if (pais){
    const provincia = pais.provincias.find( (element)=> element.nombre==_req.params.provincia)
    if(!provincia){return _res.sendStatus(400) }
    if(_req.body.nombre  ) {
      pais.provincias[pais.provincias.indexOf(provincia)].nombre = _req.body.nombre;
    }
    if(_req.body.ciudades==false||_req.body.ciudades==undefined) {pais.provincias[pais.provincias.indexOf(provincia)].ciudades = _req.body.ciudades;} 
    return _res.send(  "Patcheado exitosamente ponele" )       
  }
  _res.sendStatus(400)
})

 

 /** 
* @openapi
* paths:
*   /paises/{pais}/{provincia}/{ciudad}:
*     patch:
*       parameters:
*         - in: path
*           name: pais
*         - in: path
*           name: provincia
*         - in: path
*           name: ciudad
*       tags: 
*         - patch
*       summary: Reepmlaza los datos de la ciudad por aquellos del body que no sean undefined o false
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*                $ref: '#/components/schemas/Ciudad'
*           
*       responses:
*         200:
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Ciudad'
*/

app.patch( '/paises/:pais/provincias/:provincia/ciudades/:ciudad', (_req,_res)=> {
  const pais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  console.log( pais )
  if (pais){
    const provincia = pais.provincias.find( (element)=> element.nombre.toLowerCase()==_req.params.provincia.toLowerCase())
    if(!provincia){return _res.sendStatus(400) }
    const ciudad = provincia.ciudades.find((element)=> element.nombre.toLowerCase()==_req.params.ciudad.toLowerCase())
    if(!ciudad){return _res.sendStatus(400)}
    if(_req.body.nombre  ) {
      pais.provincias[pais.provincias.indexOf(provincia)].ciudades[provincia.ciudades.indexOf(ciudad)].nombre = _req.body.nombre;
    }
    if(_req.body.registroDeTemperatura==false || _req.body.registroDeTemperatura==undefined) {paises[paises.indexOf(pais)].provincias[pais.provincias.indexOf(provincia)].ciudades[provincia.ciudades.indexOf(ciudad)].registroDeTemperatura = _req.body.registroDeTemperatura;} 
    return _res.send(  "Patcheado exitosamente ponele" ) 
  }
  _res.sendStatus(400)    
})


 /** 
* @openapi
* paths:
*   /paises/{pais}/{provincia}/{ciudad}/{fecha}:
*     patch:
*       parameters:
*         - in: path
*           name: pais
*         - in: path
*           name: provincia
*         - in: path
*           name: ciudad
*         - in: path
*           name: fecha
*       tags: 
*         - patch
*       summary: Reepmlaza los datos de la fecha por aquellos del body que no sean undefined o false
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*                $ref: '#/components/schemas/Tiempo'
*           
*       responses:
*         200:
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Tiempo'
*/


app.patch( '/paises/:pais/provincias/:provincia/ciudades/:ciudad/fechas/:fecha', (_req,_res)=> {
  const pais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  console.log( pais )
  if (pais){
    const provincia = pais.provincias.find( (element)=> element.nombre==_req.params.provincia)
    if(!provincia){return _res.status(400).send("No province?") }
    const ciudad = provincia.ciudades.find((element)=> element.nombre.toLowerCase()==_req.params.ciudad.toLowerCase())
    if(!ciudad){return _res.status(400).send("no city?")}
    const f = ciudad.registroDeTemperatura.find( (pa) => pa.fecha.toString() === _req.params.fecha )
    if(!f){return _res.status(400).send("no fecha?")}
    if(_req.body.fecha  ) {
      pais.provincias[pais.provincias.indexOf(provincia)].ciudades[provincia.ciudades.indexOf(ciudad)].registroDeTemperatura[ciudad.registroDeTemperatura.indexOf(f)].fecha = new Date(_req.body.fecha);
    }
    if(_req.body.grados) {pais.provincias[pais.provincias.indexOf(provincia)].ciudades[provincia.ciudades.indexOf(ciudad)] = _req.body.grados;} 
    return _res.send(  "Patcheado exitosamente ponele" ) 
  }
  _res.sendStatus(  400 )    
})

app.get('/', (_req , _res) => _res.send('Bienvenido a mi API REST!'));

/** 
* @openapi
* paths:
*   /paises:
*     delete:
*       tags: 
*         - delete
*       summary: Borra el pais cuyo nombre coincida con el enviado en el body
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Pais'
*           
*       responses:
*         200:
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Pais'
*       
*/

app.delete("/paises", async (_req, _res) => {
  try {
    const r = await collections.paises?.deleteOne( { nombre: _req.body.nombre } );

    if (r && r.deletedCount) {
      _res.status(202).send(`Se fue a cagar! yei `);//${id}
    } else if (!r) {
      _res.status(400).send(`No!!!`);
    } else if (!r.deletedCount) {
      _res.status(404).send(` no existe geniopfsjmerg`);
    }
  } catch (error) {
      _res.status(400).send("error");
  }
});

 /** 
* @openapi
* paths:
*   /paises/{pais}:
*     delete:
*       parameters:
*         - in: path
*           name: pais
*           schema:
*             type: string
*             default: Argentina
*           required: true
*       tags: 
*         - delete
*       summary: Borra la provincia indicada en el body
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Provincia'
*           
*       responses:
*         200:
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Provincia'
*       
*/

 app.delete( '/paises/:pais', (_req,_res)=> {
  const p = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  console.log( _req.body )
  if (p){
    const pr = p.provincias.find((pa) => { console.log(pa); return pa.nombre === _req.body.nombre} )
    console.log(pr)
    if(!pr){return _res.status(400).send("no saturado?")}
    const ent = paises[paises.indexOf(p)].provincias.find( ( prov )=> prov.nombre===_req.body.nombre )
    if(!ent){return _res.sendStatus(400)}
    const posDelete = paises[paises.indexOf(p)].provincias.indexOf(ent)
    //if(!posDelete){return  _res.status(400).send(" no array? ") }
    //delete paises[paises.indexOf(p)].provincias[p.provincias.indexOf(pr)]
    paises[paises.indexOf(p)].provincias.splice( posDelete,1 )
    return _res.send(  "Borrado exitosamente ponele" )   
  }
  _res.sendStatus( 400 )    
})

 /** 
* @openapi
* paths:
*   /paises/{pais}/{provincia}:
*     delete:
*       parameters:
*         - in: path
*           name: pais
*           schema:
*             type: string
*             default: Argentina
*           required: true
*         - in: path
*           name: provincia
*           schema:
*             type: string
*             default: BSAS
*           required: true
*       tags: 
*         - delete
*       summary: Borra la ciudad indicada en el body
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Ciudad'
*           
*       responses:
*         200:
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Ciudad'
*       
*/

app.delete( '/paises/:pais/provincias/:provincia', (_req,_res)=> {
  const p = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  console.log( p )
  if (p){
    const pr = p.provincias.find((pa) => pa.nombre.toLowerCase() === _req.params.provincia.toLowerCase())
    if(!pr){return _res.status(400).send("no apache2?")}
    const ciudad = pr.ciudades.find( (pa)=> pa.nombre.toLowerCase()=== _req.body.nombre.toLowerCase() )
    if(!ciudad){return  _res.status(400).send(" no array? ") }
    const posDelete = pr.ciudades.indexOf(ciudad)
    paises[paises.indexOf(p)].provincias[p.provincias.indexOf(pr)].ciudades.splice( posDelete,1 );    return _res.send(  "Borrado exitosamente ponele" )   
  }
  _res.sendStatus(  400 )    
})
 /** 
* @openapi
* paths:
*   /paises/{pais}/{provincia}/{ciudad}:
*     delete:
*       parameters:
*         - in: path
*           name: pais
*           schema:
*             type: string
*             default: Argentina
*           required: true
*         - in: path
*           name: provincia
*           schema:
*             type: string
*             default: BSAS
*           required: true
*         - in: path
*           name: ciudad
*           schema:
*             type: string
*             default: CABA
*           required: true
*       tags: 
*         - delete
*       summary: Borra el registro de tiempo indicado en el body
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Tiempo'
*           
*       responses:
*         200:
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Tiempo'
*       
*/
app.delete( '/paises/:pais/provincias/:provincia/ciudades/:ciudad', (_req,_res)=> {
  const p = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais)
  console.log( p )
  if (p){

    const pr = p.provincias.find((pa) => pa.nombre.toLowerCase() === _req.params.provincia.toLowerCase())
    if(!pr){return _res.status(400).send("no nginx?")}
      const ciudad = pr.ciudades.find( (pa)=> pa.nombre=== _req.params.ciudad.toLowerCase() )
      if(!ciudad){return  _res.status(400).send(" no array? ") }
      console.log(_req.body.fecha)
      const reg = ciudad.registroDeTemperatura.find( (pa)=>{return pa.fecha.toString() === _req.body.fecha.toString() } )
      if(!reg){return _res.status(400).send("messi")}
      const posDelete = ciudad.registroDeTemperatura.indexOf(reg)
      paises[paises.indexOf(p)].provincias[p.provincias.indexOf(pr)].ciudades[pr.ciudades.indexOf(ciudad)].registroDeTemperatura.splice( posDelete,1 )
      return _res.send(  "Borrado exitosamente ponele" )    
    }
    _res.sendStatus(  400 )
   }

)

/** 
* @openapi
* /paises:
*   get:
*     tags: 
*       - get
*     responses:
*       200:
*         description: Funcionamiento normal
*/




function PaisByName(nombre: String) {
    return paises.find( item => { return item.nombre== nombre} );    
}
/** 
* @openapi
* /paises/{pais}:
*   get:
*     parameters:
*       - in: path
*         name: pais
*     tags: 
*       - get
*     responses:
*       200:
*         description: Funcionamiento normal
*/
 app.get( '/paises/:pais', async(_req,_res)=> {
  const paises = await ConvertColectionToPais( db )
  _res.status(200).send(await findPais(paises,_req.params.pais))   
     }

 )

 /** 
* @openapi
* /paises/{pais}/{provincia}:
*   get:
*     parameters:
*       - in: path
*         name: pais
*       - in: path
*         name: provincia
*     tags: 
*       - get
*     responses:
*       200:
*         description: Funcionamiento normal
*/

app.get('/paises/:pais/provincias/:provincia', async (_req,_res)=> 
{  
  const paises  = await ConvertColectionToPais(db)
  const pais    = await findPais(paises,_req.params.pais)
  if (!pais){ return _res.sendStatus(400) }
   _res.status(200).send( await findProvincia( pais,_req.params.provincia ) )
   /*
    if( !_req.params.pais || !_req.params.provincia){  return _res.status(400).send("pogichamps")}
    const element = PaisByName(_req.params.pais);
    if(!element){return _res.sendStatus(400)}
    console.log(element, element?.getProvincia(_req.params.provincia));
    
    _res.send( element!.getProvincia( _req.params.provincia) )*/
     } )

/** 
* @openapi
* /temperaturaPromedio/:
*   get:
*     tags: 
*       - temperaturaPromedio
*     responses:
*       200:
*         description: Funcionamiento normal
*/

    
    
    

/** 
* @openapi
* /temperaturaPromedio/{pais}:
*   get:
*     parameters:
*       - in: path
*         name: pais
*     tags: 
*       - temperaturaPromedio
*     responses:
*       200:
*         description: Funcionamiento normal
*/
app.get( '/temperaturaPromedio/:pais', (_req,_res) => {
  if (!_req.params.pais) {
    return _res.status(400).send("te falto el pais capo")
  }
  let grados:Array<Number> = new Array<Number>  
   const x = PaisByName(_req.params.pais)
  x!.provincias.forEach( (provincia) => { provincia.ciudades.forEach( ( c )=>{ c.registroDeTemperatura.forEach( (regis)=>{ grados.push(regis.grados) } ) } ) }  )
  if(!x) { return _res.status(400).send("snickers?")}
  let promedio:Number = new Number; 
  grados.forEach( (celsius)=> { if(!promedio){promedio=celsius.valueOf()}else{promedio=promedio.valueOf()+celsius.valueOf() }  }  )
  if(promedio) { return _res.json({ "promedio" : promedio.valueOf()/grados.length}) }
  return _res.sendStatus(400)
 } )

/** 
* @openapi
* /temperaturaPromedio/{pais}/{provincia}:
*   get:
*     parameters:
*       - in: path
*         name: pais
*       - in: path
*         name: provincia
*     tags: 
*       - temperaturaPromedio
*     responses:
*       200:
*         description: Funcionamiento normal
*/


 app.get( '/temperaturaPromedio/:pais/provincias/:provincia', (_req,_res) => {
  if (!_req.params.pais) {
    return _res.status(400).send("te falto el pais capo")
  }
  if (!_req.params.provincia) {
    return _res.status(400).send("te falto provincia capo")
  }
  let grados:Array<Number> = new Array<Number>  
   const pais = PaisByName(_req.params.pais)
   if(!pais){return _res.status(400).send("nope")}
  const x = pais.provincias.find( (pa)=> pa.nombre===_req.params.provincia )
  if(!x) { return _res.status(400).send("snickers?")}
  x.ciudades.forEach( (city)=> { city.registroDeTemperatura.forEach( (regs)=>{ grados.push(regs.grados) } ) } )
  let promedio:Number = new Number; 
  grados.forEach( (celsius)=> { if(!promedio){promedio=celsius.valueOf()}else{promedio=promedio.valueOf()+celsius.valueOf() }  }  )
  if(promedio) { return _res.json({ "promedio" : promedio.valueOf()/grados.length}) }
  return _res.sendStatus(400)
 } )


 /** 
* @openapi
* /paises:
*   post:
*     tags: 
*       - post
*     summary: Agrega un pais con los datos del body
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*              $ref: '#/components/schemas/Pais'
*           
*     responses:
*       200:
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Pais'
*/

/*app.post("/paises", async (_req,_res) => {
  const paises = await ConvertColectionToPais(db)
  const x = _req.body as Pais
  const resultado = await collections.paises?.insertOne(Pais)
  //const prueba = (await db.collection("paises").find().toArray()).push()
})*/

app.post("/paises", async (_req, _res) => {
  try {
      const newPais = _req.body as Pais;

      const existePais = await collections.paises?.findOne({ nombre: newPais.nombre });
      if(existePais){ return _res.status(400).send("Ya existe hijueputa") }

      const r = await collections.paises?.insertOne(newPais);
      r
          ? _res.status(201).send(`Se creo yei ${r.insertedId}`)
          : _res.status(500).send("Que haces?");
  } catch (error) {
      _res.status(400).send("hola");
  }
});

/** 
* @openapi
* paths:
*   /paises/{pais}:
*     post:
*       parameters:
*         - in: path
*           name: pais
*           schema:
*             type: string
*             default: Argentina
*           required: true
*       tags: 
*         - post
*       summary: Agrega una provincia a un pais, con los datos del body
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*                $ref: '#/components/schemas/Provincia'
*           
*       responses:
*         200:
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Provincia'
*/


/*
app.post("/paises/:pais", (_req,_res) => {
  const p = new Provincia(_req.body.nombre, _req.body.ciudades);
  console.log(_req.body.nombre," ", _req.body.ciudades)
  const dirPais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  if(!dirPais) {return _res.sendStatus(400)}
  const repetido = dirPais.provincias.find( (pa)=>pa.nombre===_req.body.nombre )
  if(repetido){return _res.status(400).send("Ya existe la provincia")}
  console.log(p)
  paises[paises.indexOf(dirPais)].provincias.push(p)
  _res.json(p);   
}) gggggggg*/ 

/*app.post("/paises/:pais", (_req,_res) => {
  const p = new Provincia(_req.body.nombre, _req.body.ciudades);
  const dirPais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  if(!dirPais) {return _res.status(400)}
  paises[paises.indexOf(dirPais)].provincias.push(p)
  _res.json(p);   
})*/

app.post("/paises/:pais", async (_req, _res) => {
    const p = new Provincia(_req.body.nombre, _req.body.ciudades);
    const dirPais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
    if(!dirPais) {return _res.status(400)}
});

/** 
* @openapi
* paths:
*   /paises/{pais}/{provincia}:
*     post:
*       parameters:
*         - in: path
*           name: pais
*           schema:
*             type: string
*             default: Argentina
*           required: true
*         - in: path
*           name: provincia
*           schema:
*             type: string
*             default: Pueyrredon
*           required: true
*       tags: 
*         - post
*       summary: Agrega una ciudad con los datos del body
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*                $ref: '#/components/schemas/Ciudad'
*           
*       responses:
*         200:
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Ciudad'
*/

app.post("/paises/:pais/provincias/:provincia", (_req,_res) => {
  const p = new Ciudad(_req.body.nombre, _req.body.registroDeTemperatura);
  const dirPais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  if(!dirPais) {return _res.sendStatus(400)}
  const dirProvincia = dirPais.provincias.find((pa) => pa.nombre.toLowerCase() === _req.params.provincia.toLowerCase() )
  if(!dirProvincia) {return _res.sendStatus(400)}
  if(dirProvincia.ciudades.find( (pa)=>pa.nombre===_req.body.nombre )) { return _res.status(400).send("ya existe la ciudad") }
  
  paises[paises.indexOf(dirPais)].provincias[paises[paises.indexOf(dirPais)].provincias.indexOf( dirProvincia ) ].ciudades.push(p);
  _res.json(p);   
})

/** 
* @openapi
* paths:
*   /paises/{pais}/{provincia}/{ciudad}:
*     post:
*       parameters:
*         - in: path
*           name: pais
*       tags: 
*         - post
*       summary: Agrega un registro de tiempo con los datos del body
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*                $ref: '#/components/schemas/Tiempo'
*           
*       responses:
*         200:
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Tiempo'
*/

app.post("/paises/:pais/provincias/:provincia/ciudades/:ciudad", (_req,_res) => {
  console.log("entre")
  const p = new Tiempo(_req.body.fecha, _req.body.grados);
  const dirPais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  console.log(dirPais)
  if(!dirPais) {return _res.sendStatus(400)}
  const dirProvincia = dirPais.provincias.find((pa) => pa.nombre.toLowerCase()  === _req.params.provincia.toLowerCase() )
  console.log(dirProvincia)
  if(!dirProvincia) {return _res.status(400).send("no")}
  const ciudad = dirProvincia.ciudades.find((pa) => pa.nombre.toLowerCase()  === _req.params.ciudad.toLowerCase() )
  console.log(ciudad)
  if(!ciudad) {return _res.sendStatus(400)}
  if ( ciudad.registroDeTemperatura.find( (temp)=>temp.fecha===_req.body.fecha ) ){ return _res.status(400).send("Temperatura ya registrada") }

  paises[paises.indexOf(dirPais)].provincias[dirPais.provincias.indexOf( dirProvincia ) ].ciudades[dirProvincia.ciudades.indexOf(ciudad) ].registroDeTemperatura.push(p);
   _res.json(p);
   return _res.sendStatus(200)   
})

/** 
* @openapi
* /paises/{pais}/{provincia}/{ciudad}:
*   get:
*     parameters:
*       - in: path
*         name: pais
*       - in: path
*         name: provincia
*       - in: path
*         name: ciudad
*     tags: 
*       - get
*     responses:
*       200:
*         description: Funcionamiento normal
*/

app.get('/paises/:pais/provincias/:provincia/ciudades/:ciudad', async (_req,_res)=> { 
  const paises  = await ConvertColectionToPais(db)
  const pais    = await findPais(paises,_req.params.pais)
  if(!pais){return _res.sendStatus(400)}
  const provincia = await findProvincia( pais,_req.params.provincia )
  if(provincia) return _res.status(200).send( await findCiudad( provincia,_req.params.ciudad ) )
  return _res.sendStatus(400)
} )

    

 app.listen(port, () => {console.log(`Escuchando en el puerto ${port}!`); 
 swaggerDocs(app,port)  
});
 

} 


 main()