const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const Droits = require('./models/Droits');
const Emprunts = require ('./models/Emprunts');
const Livres = require ('./models/Livres');
const Reservations = require ('./models/Reservations');
const Utilisateurs = require ('./models/Utilisateurs');
const path = require('path');
const bodyParser = require('body-parser');

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

//page Acceuil
app.get('/',(req,res) => {
    res.render('Acceuil');
});


//Page register and login
app.get('/login', async (req, res) => {
    res.render('login');
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
        res.redirect("/")                 
             
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
        switch (userLogin.Droit_id){
            case 99: 
                res.redirect("/admin")
                break;
            case 0: 
                res.redirect("/utilisateur")
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


//profil fait Mohamed Wafi
app.get('/profils/:profil', (req, res) => {
    //D'abord, on déclare idUser qui va être l'élément saisi par l'utilisateur (donc les paramètres de la requête)
    var idUser=req.params.profil;
    //On utilise le schéma Utilisateurs qui va chercher le profil en fonction de l'idUser (saisi par l'utilisateur)
     Utilisateurs.findById(idUser).then((result)=>{
     console.log(result)
     //Par la suite, on retourne la page Profil.ejs "Profil" comme résultat de la BD
     //Avec cela, il va être possible d'afficher des utilisateurs sur EJS en faisant Profil."AttributQuelconque"
     res.render('Profil.ejs', {Profil: result})
     
    });

//res.render('profil.ejs', {profil: result});

});

app.get('/roro', (req, res) => {
    
     res.render('Profil.ejs')
    
    
});


app.get('/recherche', (req, res) => {  
    /**
     * Il faut  change cette parite en MongoDB
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

//page gestion
app.get('/gestion', async (req, res) => {
    Utilisateurs.find({},function(err,utilisateurs){
        try{
            Livres.find({},function(err,livres){
                try{
                    Emprunts.find({},function(err,emprunts){
                        try{
                            //console.log(emprunts)
                            res.render('Gestion',{utilisateurs: utilisateurs, livres: livres, emprunts: emprunts});
                        }catch(err){
                            console.log(err)
                            res.status(450).end(err)
                        }
                    })
                }catch(err){
                    console.log(err)
                    res.status(450).end(err)
                }
            })
        }catch(err){
            console.log(err)
            res.status(450).end(err)
        }
    })
  

    
});



app.listen(port, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", port);
});





