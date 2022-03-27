const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const Droits = require('./models/Droits');
const Emprunts = require ('./models/Emprunts');
const Livres = require ('./models/Livres');
const Reservations = require ('./models/Reservations');
const Utilisateurs = require ('./models/Utilisateurs');
const path = require('path');

const { check, validationResult }= require ('express-validator');
const bodyParser = require('body-parser');
var urlencodeParser= bodyParser.urlencoded({extended: true});

//use express
const app = express();
const port = 4000
const { is } = require("express/lib/request");
const { Console } = require("console");
//Ceci est une variable globale qui va stocket le id de l'utilisateur connecté afin de permettre la modification de ses informations
var idUserActuel;


app.use(express.json())
app.use(express.urlencoded())

/**
 * Acces aux CSS
 */
app.use(express.static('public'))
app.use('/CSS', express.static(__dirname + 'CSS'))
app.use('/public', express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: false
 }));
app.use(bodyParser.json());

//page Acceuil
app.get('/',(req,res) => {
    res.render('Acceuil');
});


//Page register and login
app.get('/login', async (req, res) => {
    res.render('login');
});

/*
//register and login
app.post('/', async (req, res) => {
    const dataReceived = req.body
    //console.log(dataReceived);

    //register
    if (dataReceived.option == "signUp"){
        //check valide
        if (!dataReceived.username){
            return res.status(422).end('username is required')
        }

        if (!dataReceived.password){
            return res.status(422).end('password is required')
        }

        if (!dataReceived.email){
            return res.status(422).end('email is required')
        }
        //res.send('post checked')
        
        //put new user data to mongodb
        try{
            const user = await User.create({
            username: dataReceived.username,
            password: dataReceived.password,
            email: dataReceived.email  
        })
        console.log('Utilisateur cree')    
        res.redirect("/Liste")

        }catch(err){
            console.log(err)
            return res.status(422).end('user exist')
        }         
    }//End of register  

    //login
    if (dataReceived.option == "signIn"){
        //check data received valide
        const dataReceived = req.body       
        if (!dataReceived.username){
            return res.status(422).end('username is required')
        }

        if (!dataReceived.password){
            return res.status(422).end('password is required')
        }
        //console.log("login post checked")

        //find user with same name
        const userLogin = await User.findOne({
            username: dataReceived.username
        })
        if (!userLogin) { 
            return res.status(422).send({ message: 'user not exist'})
        }
        //compaire password
        const isPasswordValid = require('bcrypt').compareSync(
            dataReceived.password,
            userLogin.password
        )
        if (!isPasswordValid) {
            return res.status(422).send({ message: 'wrong password' })
        }

        res.redirect("/Liste")
        //end of login
    }

   
});//end of post

//register and login sql



*/


// DÉBUT DE LA PARTIE DE MOHAMED WAFI

//TROUVER LE PROFIL D'UN USER- MOHAMED WAFI
app.get('/profils/:profil', (req, res) => {
    //D'abord, on déclare idUser qui va être l'élément saisi par l'utilisateur (donc les paramètres de la requête)
    var telUser=req.params.profil;
    //On utilise le schéma Utilisateurs qui va chercher le profil en fonction de l'idUser (saisi par l'utilisateur)
    //La recherche dans la base de données Mongo se fait à partir du numero de téléphone qui est unique
     Utilisateurs.find({ Telephone: telUser}, function (err, result) {
         //En cas d'erreur
        if (err) Console.Log(err);
        res.render('Profil.ejs', {profil: result})
        //Lorsque l'utilisateur est connecté, on stocke son ID pour pouvoir le réutiliser dans la modification des informations
        idUserActuel=result[0]._id;
       });


    });

//MISE À JOUR DES INFORMATIONS- MOHAMED WAFI
app.get('/Modifier', (req, res) => {
    // On effectue une recherche dans la BD de l'utilisateur ayant le ID connecté pour remplir les champs vides de la page ModifierProfil
    Utilisateurs.findById(idUserActuel, function (err, result) {
    // On déclare le user recherché avec ses attributs  
        var user = {
            email: result.Email,
            name: result.Nom,
            prenom: result.Prenom,
            telephone: result.Telephone,
            photo: result.Photo
        }
       console.log(user);
       //On passe le user cherché à la page ejs pour remplir les champs vides avec les informations de ce dernier
       res.render('ModifierProfil.ejs', {user: user})
    });
  
    
});

app.post('/Modifier', urlencodeParser, (req, res)=> {
    
    console.log(idUserActuel);
    //Lorsque le client finit de remplir le formulaire, il fait un post. Ce post va prendre les informations que le client a saisi
    //puis faire la mise à jour du compte utilisateur dans la BD mongo
    Utilisateurs.findOneAndUpdate({_id:idUserActuel},{
        Nom: req.body.nomModifie, 
        Prenom: req.body.prenomModifie, 
        Telephone: req.body.telephoneModifie, 
        Email: req.body.emailModifie, 
        Photo: req.body.photoModifie,}, 
        (err)=>{
        if (err){
            console.log(err)
        }
        console.log("Utilisateur mis à jour")
    })     
});
    
//MISE À JOUR DU MOT DE PASSE- MOHAMED WAFI
app.get('/ModifierMotDePasse',(req, res) => {

});

app.post('/ModifierMotDePasse',urlencodeParser,(req, res) => {

});

// FIN DE LA PARTIE DE MOHAMED WAFI
app.get('/recherche', (req, res) => {  
    /**
     * Il faut  change cette partie en MongoDB
     */
    /*
    try{
        let query = "SELECT ISBN, Titre, Photo FROM LIVRES"
        db.query(query, function (err, result) {
            res.render('recherche', {livresTab: result})
        });
        
    }catch(err){
        console.log(err);
    }
    */  
    res.render('recherche')
})

//livre
app.get('/livres/:isbn', (req, res) => {

       /**
     * Il faut  change cette parite en MongoDB
     */
    /*
    var isbn = req.params.isbn;
    var sql =  "select * from livres where isbn =" +"'" +isbn+"'" +";";
    db.query(sql, function (err, result) {
        if (err) {
            result.render("404.ejs");
        } else {
            res.render('livres.ejs', { livre: result });
        }
    });
    */

    res.render('livres.ejs');
});


app.listen(port, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", port);
});





