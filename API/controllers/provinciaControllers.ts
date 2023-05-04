
import {dbPromise,DB_CONN_STRING,DB_NAME,COLLECTION_NAME,ConvertColectionToPais,ConvertDocumentToPais,getPais,findPais,findCiudad,findProvincia,collections} from '../DataBaseFunctions/DBFunctions'
import { Pais } from '../Pais';
import { Provincia } from '../Provincia';


export default{
    getProvincia: (async (_req,_res)=> {
        const paises  = await ConvertColectionToPais(await dbPromise)
        const pais    = await findPais(paises,_req.params.pais)
        if (!pais){ return _res.sendStatus(400) }
        _res.status(200).send( await findProvincia( pais,_req.params.provincia ) )
    }),

    addProvincia: (async (_req,_res)=> {
        const provincia = _req.body as Provincia
        const pais = await getPais( _req.params.pais )
        if (!pais) { _res.status(400).send( "hubo problemas encontrando la coleccion, seguramente no exista." ) }
        pais!.provincias.push( provincia )
        const posteado = await collections.paises?.findOneAndReplace( { nombre: _req.params.pais }, pais )
        _res.status(200).send(posteado?.value)
    }),

    updateProvincia: (async (_req,_res)=> {
        const provincia = _req.body as Provincia
        const pais = await getPais(_req.params.pais)
        const provAux= pais.provincias.find( (p)=>p.nombre=== _req.params.provincia )
        if(!provAux){ return _res.sendStatus(400) }
        const provPos = pais.provincias.indexOf( provAux )
        pais.provincias[provPos]=provincia
        collections.paises?.findOneAndReplace( {nombre: _req.params.pais},pais )
        _res.status(200).send("papapepo!")
    }),

    changeProvincia: (async (_req,_res)=> {
        try {
            const provincia = _req.body as Provincia
            const pais = await getPais( _req.params.pais )
            const provinciaOriginal = pais.provincias.find( (x)=>x.nombre===_req.params.provincia )
            const provPos = pais.provincias.indexOf( provinciaOriginal! )
            if( provincia.nombre ){ provinciaOriginal!.nombre= provincia.nombre }
            if (provincia.ciudades){ provinciaOriginal!.ciudades=provincia.ciudades }
            pais.provincias[provPos]=provinciaOriginal!
            collections.paises?.findOneAndReplace( {nombre:_req.params.pais} , pais)
            return _res.status(200).send("mando may guey")
        } catch (error) {
            _res.status(400).send("el que dice error es puto");
        }
    }),

    deleteProvincia: (async (_req,_res)=> {
          try {
    const provincia = _req.body as Provincia
    const pais      = await getPais( _req.params.pais )
    const provAux   = pais.provincias.find( (x)=>x.nombre===pais.nombre )
    const provPos = pais.provincias.indexOf(provAux!)
    pais.provincias.splice( provPos,1 )
    collections.paises?.findOneAndReplace( {nombre:_req.params.pais} , pais)
    return _res.status(200).send("mando may guey")
} catch (error) {
    _res.status(400).send("el que dice error es puto");
}
    })
}