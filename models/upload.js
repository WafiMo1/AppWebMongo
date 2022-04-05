//FAIT PAR MOHAMED WAFI
//path fait référence au chemin d'accès
const path= require ('path');
//Multer est un package servant à gérer les fichiers entrants dans les requêtes HTTP
const multer= require ('multer');
//cette variable storage va servir à stocker la logique pour montrer à mutler comment enregistrer les fichiers chargés
var storage= multer.diskStorage({
        //destination va indiquer au mutler de stocker les images dans le dossier public/images
        destination: function(req, file,callback){
        callback(null,'../public/Images"')
    },
    //le filename va indiquer au mutler comment nommer l'image stocker
    filename: function(req, file, callback){
        let extension=path.extname(file.originalname)
        callback(null, Date.now()+ ext)
    }
})
const upload= multer({
    storage:storage,
    //Le fileFilter va s'assurer que le client charge bel et bien une image (jpeg ou png)
    fileFilter: function(req, file, callback){
        if(file.mimetype=='image/png' ||file.mimetype=='image/jpg'){
            callback(null,true)
        }else{
            console.log('mauvaise extention du file')
            callback(null,false)
        }
    },
    limits:{
        fileSize: 180 * 180 * 2
    }


})

module.exports= upload