import express from "express"
import provinciaController from "../controllers/provinciaControllers"  


export function provinciasRoutes(app){
    app.get('/paises/:pais/provincias/:provincia', provinciaController.getProvincia);
    app.post('/paises/:pais/provincias', provinciaController.addProvincia);
    app.put('/paises/:pais/provincias/:provincia', provinciaController.updateProvincia);
    app.patch('/paises/:pais/provincias/:provincia', provinciaController.changeProvincia);
    app.delete('/paises/provincias', provinciaController.deleteProvincia);

    app.get('/temperaturaPromedio/paises/:pais/provincias/:provincia', provinciaController.getTemperaturaProvincia);
}
