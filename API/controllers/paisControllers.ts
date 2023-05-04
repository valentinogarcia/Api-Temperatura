
import {dbPromise,DB_CONN_STRING,DB_NAME,COLLECTION_NAME,ConvertColectionToPais,ConvertDocumentToPais,getPais,findPais,findCiudad,findProvincia,collections} from '../DataBaseFunctions/DBFunctions'
import { Pais } from '../Pais';


export default {
    getPaises: (async (_req,_res)=> {   
         _res.status(200).send(await ConvertColectionToPais(await dbPromise)) 
    }),

    getPais:(async(_req,_res)=> {
      const paises = ConvertColectionToPais(await dbPromise);
      const pais = (await paises).find( (p) => p.nombre === _req.params.pais  )
       _res.status(200).send(pais)  
    }),
    
    addPais:(async (_req,_res) => { 
        try {
          const newPais = _req.body as Pais;
    
          const existePais = await collections.paises?.findOne({ nombre: newPais.nombre });
          if(existePais){ return _res.status(400).send("Ya existe (leto no podemos poner eso)") }
    
          const r = await collections.paises?.insertOne(newPais);
          r
              ? _res.status(201).send(`Se creo yei ${r.insertedId}`)
              : _res.status(500).send("Que haces? GAAAAA");
      } catch (error) {
          _res.status(400).send("hola");
      }
    }),

    updatePais:(async (_req, _res) => {
        try {
            const pais = _req.body as Pais
            collections.paises?.findOneAndReplace( {nombre:_req.params.pais} , pais)
            return _res.status(200).send("mando may guey")
        } catch (error) {
            _res.status(400).send("el que dice error es puto");
        }
    }),

    changePais: (async (_req,_res)=> {
        try {
          const pais = _req.body as Pais
          const paisOriginal = await getPais( _req.params.pais )
          
          if( pais.nombre ){ paisOriginal.nombre= pais.nombre }
          if (pais.provincias){ paisOriginal.provincias=pais.provincias }
    
          collections.paises?.findOneAndReplace( {nombre:_req.params.pais} , paisOriginal)
          return _res.status(200).send("mando may guey")
      } catch (error) {
          _res.status(400).send("el que dice error es puto");
      }
    }),
    
    deletePais:(async (_req, _res) => {
        try {
          const r = await collections.paises?.deleteOne( { nombre: _req.body.nombre } );
      
          if (r && r.deletedCount) {
            _res.status(202).send(`Se fue a cagar! yei `);
          } else if (!r) {
            _res.status(400).send(`No!!!`);
          } else if (!r.deletedCount) {
            _res.status(404).send(` no existe geniopfsjmerg`);
          }
        } catch (error) {
            _res.status(400).send("error");
        }
    })

}  