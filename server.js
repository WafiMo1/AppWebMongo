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

var loginedUser = null;
var lesLivresReserves = new Array();


//page Acceuil
app.get('/',(req,res) => {
    res.render('Acceuil', {loginedUser: loginedUser});
});


//Page register and login
app.get('/login', async (req, res) => {
    if (loginedUser != null){
        res.redirect("/logout")
    }else{
        res.render('login' , {loginedUser: loginedUser});
    }  
});

app.post('/login', async (req, res) => {
    const dataReceived = req.body
    //console.log(dataReceived);

    //register
    if (dataReceived.option == "signUp"){
        
    //double check valide backend
        if (!dataReceived.signUpEmail){
            return res.status(422).end('email is required')
        }
        if (!dataReceived.signUpPassword){
            return res.status(422).end('password is required')
        }
        if (!dataReceived.signUpNom){
            return res.status(422).end('name is required')
        }
        if (!dataReceived.signUpPrenom){
            return res.status(422).end('Firstname is required')
        }
        if (!dataReceived.signUpTel){
            return res.status(422).end('tel is required')
        }

        //prepare all data need to create a new user                         
        const rand = Math.floor(Math.random() * 12) + 1;//random un image de profil
        //put new user data to mongodb  
        try{
            Utilisateurs.create({
                Nom: dataReceived.signUpNom,
                Prenom: dataReceived.signUpPrenom,
                Telephone: dataReceived.signUpTel,
                Email: dataReceived.signUpEmail,
                Password: dataReceived.signUpPassword,
                Photo: "\/Images\/Profil\/"+ rand +".png",
                MaxPret: 5,
                NbPret: 0,
                Droit_id: 0                            
            })                   
        }catch(err){
            console.log(err)
            return res.status(422).end('user exist')
        }
        console.log('Utilisateur cree')    
        res.render('Acceuil', {loginedUser: loginedUser});                
             
    }//End of register  

    //login
    if (dataReceived.option == "signIn"){
        //check data received valide
        const dataReceived = req.body       
        if (!dataReceived.signInEmail){
            return res.status(422).end('username is required')
        }

        if (!dataReceived.signInPassword){
            return res.status(422).end('password is required')
        }
        //find user with same name
        const userLogin = await Utilisateurs.findOne({
            Email: dataReceived.signInEmail
        })
        if (!userLogin) { 
            return res.status(422).send('user not exist')
        }
        const isPasswordValid = require('bcrypt').compareSync(
            dataReceived.signInPassword,
            userLogin.Password
        )
        
        if (!isPasswordValid) {
            return res.status(422).send('wrong password')
        }
        loginedUser = userLogin;
        switch (userLogin.Droit_id){
            case 99: 
                res.redirect("/gestion")
                break;
            case 0: 
                res.redirect("/reservations")
                break;
            case 1:
                res.redirect("/staff")
                break;
            default:
                res.status(423).end("Droit n'existe pas")
        }
        //end of login
    }
   
});//end of post

app.get('/logout', (req,res)=>{
    loginedUser = null;
    res.redirect("/") 
})


//profil fait Mohamed Wafi
app.get('/profils/:profil', (req, res) => {
    //D'abord, on déclare idUser qui va être l'élément saisi par l'utilisateur (donc les paramètres de la requête)
    var telUser=req.params.profil;
    //On utilise le schéma Utilisateurs qui va chercher le profil en fonction de l'idUser (saisi par l'utilisateur)
    //La recherche dans la base de données Mongo se fait à partir du numero de téléphone qui est unique
     Utilisateurs.find({ Telephone: telUser}, function (err, result) {
         //En cas d'erreur
        if (err) Console.Log(err);
        res.render('Profil.ejs', {profil: result, loginedUser: loginedUser})
       
       });


    });


app.get('/Modifier', (req, res) => {

     res.render('ModifierProfil',{loginedUser: loginedUser});

    
});

app.post('/Modifier', urlencodeParser, (req, res)=> {
    userActuel= conservationInfosUser();
    var idUser=userActuel._id;
    Utilisateurs.findByIdAndUpdate({_id:idUser},{
        Nom: req.body.nomModifie,
        Prenom: req.body.prenomModifie,
        Telephone: req.body.telephoneModifie,
        Email: req.body.emailModifie,
        Photo: req.body.photoModifie,  
    }) 
});

function conservationInfosUser(){

}
   
 

app.get('/recherche', (req, res) => {  

        Livres.find({}, function(err,livres){
            try{
                res.render("Recherche", {livresTab:livres, loginedUser: loginedUser})
            }catch(err){
                console.log(err);
            }
        });

});

//livre
app.get('/livres/:isbn', (req, res) => {
    Livres.find({ISBN: req.params.isbn}, function(err,donneesLivre){
        try{
            res.render("Livres", {livre:donneesLivre, loginedUser: loginedUser})
        }catch(err){
            console.log(err);
        }
    });
});

app.post('/livres/:isbn', (req, res) => {
    if(loginedUser == null) res.redirect("/login")
    else {
        Reservations.findOne({ Livre_id : req.body.livre_id, Utilisateur_id: loginedUser._id }, function (err, livre) {
            if(livre == null && req.body.livre_NbDisponible > 0){
                const date = Date.now()
                const livreReservee = new Reservations(
                    {
                        DateReservation: date,
                        Livre_id: req.body.livre_id,
                        Utilisateur_id: loginedUser._id
                    }
                );
                livreReservee.save(function (err) {
                    if (err) console.log(err)
                    console.log("Le livre: " + req.body.livre_Titre + " a ete reserve par l'user " + loginedUser.Nom)
                });
                Livres.findByIdAndUpdate(req.body.livre_id, { NbDisponible: req.body.livre_NbDisponible - 1 },
                    function (err, livre) {
                        if (err) {
                            console.log(err);
                        }
                    })
                res.redirect("/reservations")
            }else {
                console.log("Le livre: " + req.body.livre_Titre + " ne peut pas etre reserve par l'user " + loginedUser.Nom)
            }  
        })
    }
});

app.get('/reservations', (req, res) => {
    if(loginedUser == null) res.redirect("/login")
    Reservations.find({Utilisateur_id: loginedUser._id}, function(err,lesRes){
        if (err) console.log(err)
        Livres.find({}, function (err, donneesLivre) {
            if (err) console.log(err)
            res.render("Reservations", {resInfo : lesRes, livres : donneesLivre, loginedUser : loginedUser})
        });
    });
});

app.post('/annulerReservation', (req, res) => {
    if(loginedUser == null) res.redirect("/login")
    else {
        Reservations.findOneAndDelete({ Livre_id : req.body.livre_id, Utilisateur_id: loginedUser._id }, 
            function (err, livre) {
            if (err) console.log(err)
            console.log("La reservation pour le livre " + req.body.livre_titre + " a ete annuler par l'user " + loginedUser.Nom);
            
            Livres.findByIdAndUpdate(req.body.livre_id, { NbDisponible: parseInt(req.body.livre_NbDisponible)+ 1 },
                function (err, livre) {
                    if (err) console.log(err)
                    else console.log("Le nombre de copies disponible pour le livre " + req.body.livre_titre + " a ete mise a jour par l'user " + loginedUser.Nom);    
            })
        })
        res.redirect("/reservations")
    }
});

//page gestion
app.get('/gestion', async (req, res) => {
    Utilisateurs.find({},function(err,utilisateurs){
        try{
            Livres.find({},function(err,livres){
                try{
                    Emprunts.find({},function(err,emprunts){
                        try{
                            res.render('Gestion',{utilisateurs: utilisateurs, livres: livres, emprunts: emprunts, loginedUser: loginedUser});
                        }catch(err){
                            res.status(450).end(err)
                        }
                    })
                }catch(err){
                    res.status(450).end(err)
                }
            })
        }catch(err){
            res.status(450).end(err)
        }
    })
});

app.listen(port, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", port);
});