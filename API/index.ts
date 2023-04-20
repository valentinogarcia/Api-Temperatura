/*

Json para post en /paises/
{
  "nombre": "Rusia",
  "provincias": [{"nombre": "Moscow","ciudades": [{"id": 2,"nombre": "Pueyrredon","registroDeTemperatura": [{"fecha": "2023-04-04T20:12:29.103Z", "grados": 0}]}]}]
  
}

Json para Patch en /paises/:pais

{
 "nombre":"Volga",
  "ciudades": [ { "nombre": "Stalingrado", "registroDeTemperatura": [{
    "fecha" : "9-11-1942", 
        "grados" : -18  }] } ] 
}

*/




import { Ciudad } from './Ciudad';
import { Pais } from './Pais';
import { Provincia } from './Provincia';
import { Tiempo } from './Tiempo';
import express from 'express';


async function genCiudad(t1:number,t2:number,t3:number) {
  let fecha = new Date()
fecha.setFullYear(1989)
fecha.setDate(1)
let genTiempo       = new Tiempo( new Date(),t1 )
let tiempos         = new Array<Tiempo>
tiempos.push(genTiempo)
setTimeout(() => {
  genTiempo= new Tiempo( new Date(),t2 )
  tiempos.push( genTiempo )
}, 50000);

setTimeout(() => {
  genTiempo= new Tiempo( new Date(),t2 )
  tiempos.push( genTiempo )
}, 50000);

setTimeout(() => {
  genTiempo= new Tiempo( fecha,t3 )
  tiempos.push( genTiempo )
}, 50000);


return tiempos
}

async function main() {
  
  
let tiempos = await genCiudad(30,32,36)
let gciudad= new Ciudad("CABA",tiempos)
let ciudades = new Array<Ciudad>
tiempos= await genCiudad(20,21,15)
ciudades.push(new Ciudad("Pueyrredon",tiempos) )
tiempos=await genCiudad( 40,35,37 )
ciudades.push(new Ciudad("Mar Del Plata",tiempos) )

let provins = new Array<Provincia>
let genprovincia = new Provincia("BSAS",ciudades)
provins.push(genprovincia)

ciudades = new Array<Ciudad>
tiempos = await genCiudad(30,32,36)
gciudad= new Ciudad("La Cumbresita",tiempos)
 ciudades = new Array<Ciudad>
 tiempos=await genCiudad(20,21,15)
 ciudades.push(new Ciudad("Ciudad de Cordoba",tiempos) )
 tiempos=await genCiudad( 40,35,37 )
 ciudades.push(new Ciudad("Yacanto",tiempos) )
genprovincia = new Provincia("Cordoba",ciudades)
provins.push(genprovincia)
let paises = new Array<Pais>
paises.push(new Pais("Argentina",provins))
/*
const p = paises.find((pa) => pa.nombre === _req.params.pais)
console.log( p )
if (p){
  delete paises[paises.indexOf(p)]
}
_res.status(204).send()
*/

const app: express.Application = express();

const port = 3000

app.use(express.json());

app.put( '/paises/:pais', (_req,_res)=> {
  const p = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  console.log( p )
  if (p){
    paises[paises.indexOf(p)] =_req.body
  }
  _res.send(  "Putteado exitosamente ponele" )    
}

)

app.put( '/paises/:pais/:provincia', (_req,_res)=> {
  const p = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  console.log( p )
  if (p){
    const provincia = paises[paises.indexOf(p)].provincias.find((pa) => pa.nombre.toLowerCase() === _req.params.provincia.toLowerCase()  )
    if(!provincia){ return _res.status(400) }
    const x = paises[paises.indexOf(p)].provincias.indexOf( provincia )
    paises[paises.indexOf(p)].provincias[ x ] =_req.body
  }
  _res.send(  "Putteado exitosamente ponele" )    
}

)

app.put( '/paises/:pais/:provincia/:ciudad', (_req,_res)=> {
  const p = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  console.log( p )
  if (p){
    const provincia = paises[paises.indexOf(p)].provincias.find((pa) => pa.nombre.toLowerCase() === _req.params.provincia.toLowerCase()  )
    if(!provincia){ return _res.status(400) }
    const v = paises.indexOf(p)
    const x = paises[v].provincias.indexOf(provincia)
    const y = paises[v].provincias.find( (pa) => pa.nombre.toLowerCase() === _req.params.ciudad.toLowerCase() )
    
    paises[v].provincias[ x ].ciudades =_req.body    }
    _res.send(  "Putteado exitosamente ponele" )    
  }
  
  )
  
  app.patch( '/paises/:pais/', (_req,_res)=> {
    const pais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais)
    console.log( pais )
    if (pais){
      //const provincia = pais.provincias.find( (element)=> element.nombre==_req.params.provincia)
      
      if(_req.body.nombre  ) {
        paises[paises.indexOf(pais)].nombre = _req.body.nombre;
      }
         if(_req.body.ciudades) {paises[paises.indexOf(pais)].provincias = _req.body.provincias;} 
         
    }
    _res.send(  "Patcheado exitosamente ponele" )    
  }
  
  )
  
  app.patch( '/paises/:pais/:provincia', (_req,_res)=> {
    const pais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
    console.log( pais )
    if (pais){
        const provincia = pais.provincias.find( (element)=> element.nombre==_req.params.provincia)
        if(!provincia){return _res.status(400) }
        if(_req.body.nombre  ) {
          pais.provincias[pais.provincias.indexOf(provincia)].nombre = _req.body.nombre;
        }
        if(_req.body.ciudades) {pais.provincias[pais.provincias.indexOf(provincia)].ciudades = _req.body.ciudades;} 
          
      }
      _res.send(  "Patcheado exitosamente ponele" )    
    }
    
    )
    
    
    app.patch( '/paises/:pais/:provincia/:ciudad', (_req,_res)=> {
      const pais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais)
      console.log( pais )
      if (pais){
        const provincia = pais.provincias.find( (element)=> element.nombre==_req.params.provincia)
        if(!provincia){return _res.status(400) }
        const ciudad = provincia.ciudades.find((element)=> element.nombre.toLowerCase()==_req.params.ciudad.toLowerCase())
        if(!ciudad){return _res.status(400)}
        if(_req.body.nombre  ) {
          pais.provincias[pais.provincias.indexOf(provincia)].nombre = _req.body.nombre;
        }
        if(_req.body.registroDeTemperatura) {pais.provincias[pais.provincias.indexOf(provincia)].ciudades[provincia.ciudades.indexOf(ciudad)] = _req.body.registroDeTemperatura;} 
        
      }
      _res.send(  "Patcheado exitosamente ponele" )    
    }

    )

    app.patch( '/paises/:pais/:provincia/:ciudad/:fecha', (_req,_res)=> {
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
        
      }
      _res.send(  "Patcheado exitosamente ponele" )    
   }

   )
   
   
   
   app.get('/', (_req , _res) => _res.send('Bienvenido a mi API REST!'));

   app.delete( '/paises', (_req,_res)=> {
     const p = paises.find((pa) => pa.nombre === _req.body.nombre)
     console.log( p )
     if (p){
       paises.splice(paises.indexOf(p))
      }
      _res.send(  "Borrado exitosamente ponele" )    
     }
     
     )
     
     app.delete( '/paises/:pais', (_req,_res)=> {
       const p = paises.find((pa) => pa.nombre === _req.params.pais)
       console.log( p )
       if (p){
         const pr = p.provincias.find((pa) => pa.nombre.toLowerCase() === _req.body.nombre)
         if(!pr){return _res.status(400).send("no bitches?")}
         const posDelete = paises[paises.indexOf(p)].provincias.indexOf(pr)
      if(!posDelete){return  _res.status(400).send(" no array? ") }
      //delete paises[paises.indexOf(p)].provincias[p.provincias.indexOf(pr)]
      paises[paises.indexOf(p)].provincias.splice( posDelete,1 )
    }
    _res.send(  "Borrado exitosamente ponele" )    
  }
  
  )
  
  app.delete( '/paises/:pais/:provincia', (_req,_res)=> {
    const p = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
    console.log( p )
    if (p){
      const pr = p.provincias.find((pa) => pa.nombre.toLowerCase() === _req.params.provincia)
      if(!pr){return _res.status(400).send("no bitches?")}
      const ciudad = pr.ciudades.find( (pa)=> pa.nombre.toLowerCase()=== _req.body.nombre )
      if(!ciudad){return  _res.status(400).send(" no array? ") }
      const posDelete = pr.ciudades.indexOf(ciudad)
      paises[paises.indexOf(p)].provincias[p.provincias.indexOf(pr)].ciudades.splice( posDelete,1 )
    }
    _res.send(  "Borrado exitosamente ponele" )    
  }
  
)

app.delete( '/paises/:pais/:provincia/:ciudad', (_req,_res)=> {
  const p = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  console.log( "original: ", _req.body.fecha )
  if (p){
    
    const pr = p.provincias.find((pa) => pa.nombre.toLowerCase() === _req.params.provincia.toLowerCase())
    if(!pr){return _res.status(400).send("no bitches?")}
    const ciudad = pr.ciudades.find( (pa)=> pa.nombre.toLowerCase()=== _req.params.ciudad.toLowerCase() )
    if(!ciudad){return  _res.status(400).send(" no array? ") }
    // console.log(_req.body.fecha)
    const reg = ciudad.registroDeTemperatura.find( (pa)=> { console.log(pa.fecha);return pa.fecha.toString() === _req.body.fecha.toLowerCase()}  )
      console.log( )
      if(!reg){return _res.status(400).send("messi")}
      const posDelete = ciudad.registroDeTemperatura.indexOf(reg)
      paises[paises.indexOf(p)].provincias[p.provincias.indexOf(pr)].ciudades[pr.ciudades.indexOf(ciudad)].registroDeTemperatura.splice( posDelete,1 )
      _res.send(  "Borrado exitosamente ponele" ) 
    }
    _res.send("messi2")
  
  }

  )
  
  
  app.get( '/paises', (_req,_res)=> _res.send( paises )
  )
  
  
  function PaisByName(nombre: string) {
    return paises.find( item => { return item.nombre== nombre} );    
}

app.get( '/paises/:pais', (_req,_res)=> {
  
  _res.send(  PaisByName(String(_req.params.pais)) )    
}

 )
 
 /*function ProvinciaByName(element:Pais,nombre:string) {
   element.provincias.forEach(provincia => {
     if(provincia.nombre == nombre){ return provincia}        
    });  
  }
  */
 app.get('/paises/:pais/:provincia', (_req,_res)=> 
 {   
   if( !_req.params.pais || !_req.params.provincia){  return _res.status(400).send("pogichamps")}
   const element = PaisByName(_req.params.pais);
   if(!element){return _res.status(400)}
   console.log(element, element?.getProvincia(_req.params.provincia));
   
   _res.send( element!.getProvincia( _req.params.provincia) )
  } )
  
  
  app.post("/paises", (_req,_res) => {
  const p = new Pais(_req.body.nombre, _req.body.provincias);
  paises.push(p);
  _res.json(p);   
})

app.post("/paises/:pais", (_req,_res) => {
  const p = new Provincia(_req.body.nombre, _req.body.ciudades);
  const dirPais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  if(!dirPais) {return _res.status(400)}
  paises[paises.indexOf(dirPais)].provincias.push(p)
  _res.json(p);   
})


app.post("/paises/:pais/:provincia", (_req,_res) => {
  const p = new Ciudad(_req.body.nombre, _req.body.registroDeTemperatura);
  const dirPais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  if(!dirPais) {return _res.status(400)}
  const dirProvincia = dirPais.provincias.find((pa) => pa.nombre.toLowerCase() === _req.params.provincia.toLowerCase() )
  if(!dirProvincia) {return _res.status(400)}
  paises[paises.indexOf(dirPais)].provincias[paises[paises.indexOf(dirPais)].provincias.indexOf( dirProvincia ) ].ciudades.push(p);
  _res.json(p);   
})

app.post("/paises/:pais/:provincia/:ciudad", (_req,_res) => {
  const p = new Tiempo(_req.body.fecha, _req.body.grados);
  const dirPais = paises.find((pa) => pa.nombre.toLowerCase() === _req.params.pais.toLowerCase())
  if(!dirPais) {return _res.status(400)}
  const dirProvincia = dirPais.provincias.find((pa) => pa.nombre.toLowerCase() === _req.params.provincia.toLowerCase() )
  if(!dirProvincia) {return _res.status(400)}
  const ciudad = dirProvincia.ciudades.find((pa) => pa.nombre.toLowerCase() === _req.params.ciudad.toLowerCase() )
  if(!ciudad) {return _res.status(400)}
  paises[paises.indexOf(dirPais)].provincias[dirPais.provincias.indexOf( dirProvincia ) ].ciudades[dirProvincia.ciudades.indexOf(ciudad) ].registroDeTemperatura.push(p);
  _res.json(p);   
})


app.get('/paises/:pais/:provincia/:ciudad', (_req,_res)=> { 
  if( !_req.params.pais || !_req.params.provincia||!_req.params.ciudad){  return _res.status(400).send("pogichamps")}
  
  const p = PaisByName(_req.params.pais); 
    if (!p) return _res.status(400)
    
    const pr = p.getProvincia(_req.params.provincia) 
    if (!pr) return _res.status(400)
    
    _res.send(pr.ciudades.find((ciudad) => ciudad.nombre.toLowerCase() === _req.params.ciudad.toLowerCase()))
  } )
  
  
  
 app.listen(port, () => console.log(`Escuchando en el puerto ${port}!`));
}
 main()