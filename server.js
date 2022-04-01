const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const Droits = require('./models/Droits');
const Emprunts = require('./models/Emprunts');
const Livres = require('./models/Livres');
const Reservations = require('./models/Reservations');
const Utilisateurs = require('./models/Utilisateurs');

const path = require('path');

var CryptoJS = require("crypto-js");


const { check, validationResult } = require('express-validator');

const bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: true });

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
app.use(express.static(__dirname + "./public/"))
app.use('/CSS', express.static(__dirname + 'CSS'))
app.use('/public', express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

var loginedUser = null;





//page Acceuil
app.get('/', (req, res) => {
    res.render('Acceuil', { loginedUser: loginedUser });
});


//Page register and login
app.get('/login', async (req, res) => {
    if (loginedUser != null) {
        res.redirect("/logout")
    } else {
        res.render('login', { loginedUser: loginedUser });
    }
});

app.post('/login', async (req, res) => {
    const dataReceived = req.body
    //console.log(dataReceived);

    //register
    if (dataReceived.option == "signUp") {

        //double check valide backend
        if (!dataReceived.signUpEmail) {
            return res.status(422).end('email is required')
        }
        if (!dataReceived.signUpPassword) {
            return res.status(422).end('password is required')
        }
        if (!dataReceived.signUpNom) {
            return res.status(422).end('name is required')
        }
        if (!dataReceived.signUpPrenom) {
            return res.status(422).end('Firstname is required')
        }
        if (!dataReceived.signUpTel) {
            return res.status(422).end('tel is required')
        }

        //prepare all data need to create a new user                         
        const rand = Math.floor(Math.random() * 12) + 1;//random un image de profil
        //put new user data to mongodb  
        try {
            Utilisateurs.create({
                Nom: dataReceived.signUpNom,
                Prenom: dataReceived.signUpPrenom,
                Telephone: dataReceived.signUpTel,
                Email: dataReceived.signUpEmail,
                Password: dataReceived.signUpPassword,
                Photo: "\/Images\/Profil\/" + rand + ".png",
                MaxPret: 5,
                NbPret: 0,
                Droit_id: 0
            })
        } catch (err) {
            console.log(err)
            return res.status(422).end('user exist')
        }
        console.log('Utilisateur cree')
        res.render('Acceuil', { loginedUser: loginedUser });

    }//End of register  

    //login
    if (dataReceived.option == "signIn") {
        //check data received valide
        const dataReceived = req.body
        if (!dataReceived.signInEmail) {
            return res.status(422).end('username is required')
        }

        if (!dataReceived.signInPassword) {
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
        switch (userLogin.Droit_id) {
            case 99:
                res.redirect("/gestion")
                break;
            case 0:
                res.redirect("/profil")
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


app.get('/logout', (req, res) => {
    loginedUser = null;
    res.redirect("/")
})

// DÉBUT DE LA PARTIE DE MOHAMED WAFI



//TROUVER LE PROFIL D'UN USER- MOHAMED WAFI
app.get('/profil', (req, res) => {
    res.render('Profil.ejs', { loginedUser: loginedUser })
});




//MISE À JOUR DES INFORMATIONS- MOHAMED WAFI
app.get('/Modifier', (req, res) => {
    //Correspond à l'ID de l'utilisateur connecté
    idUserActuel = loginedUser._id;
    res.render('ModifierProfil.ejs', { loginedUser: loginedUser })
});

//DÉCLARATION MULTER
        /* const multer = require("multer");
        app.use(express.static(__dirname + "./public"))

        var Storage = multer.diskStorage({  
            destination: "./public/uploads/",
            filename: (req, file, cb) => {
                cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
            }
        });

        var upload = multer({
            storage: Storage
            }).single('photoModifie') */

app.post('/Modifier', urlencodeParser, (req, res) => {


    //Lorsque le client finit de remplir le formulaire, il fait un post. Ce post va prendre les informations que le client a saisi
    //puis faire la mise à jour du compte utilisateur dans la BD mongo
    console.log(req.body.nomModifie);
    Utilisateurs.findOneAndUpdate({ _id: loginedUser._id }, {
        Nom: req.body.nomModifie,
        Prenom: req.body.prenomModifie,
        Telephone: req.body.telephoneModifie,
        Email: req.body.emailModifie,
        //Modifier photo à revoir, (il faut prendre le chemin d'accès de l'image au complet)
        Photo: req.body.photoModifie
        
    });

    console.log("Utilisateur mis à jour")
    res.redirect('/')


});

//MISE À JOUR DU MOT DE PASSE- MOHAMED WAFI
app.get('/ModifierMotDePasse', (req, res) => {

    res.render('ModifierMotDePasse', { loginedUser: loginedUser })
});

app.post('/ModifierMotDePasse', urlencodeParser, (req, res) => {
    //Ce bout de code va permettre de savoir si le mot de passe "ancien" saisi par le client est bel
    //et bien celui du user connecté
    const ancienMotDepasseSaisi = require('bcrypt').compareSync(
        req.body.ancienMdp,
        loginedUser.Password
    )
    console.log(loginedUser.Password);
    if (ancienMotDepasseSaisi) {
        console.log("Le mdp saisi est bel et bien l'ancien")
        if (req.body.nvxMdp == req.body.nvxMdpDeuxiemeFois) {
            console.log("les deux nouveaux mots de passe concordent ");
            var mdpNvx= require('bcrypt').hashSync(req.body.nvxMdp, 10)
            console.log(mdpNvx)
            //On dirait que ce code ne s'exécute pas, le mot de passe ne se met pas à jour
            Utilisateurs.findOneAndUpdate({ _id: loginedUser._id }, {
                Password:mdpNvx    
            });
            console.log("le mot de passe a été mis à jour")
            console.log("Nouveau mot de passe : "+loginedUser.Password);
            
            res.json("Le mot de passe a été mis à jour")
        } else if (req.body.nvxMdp != req.body.nvxMdpDeuxiemeFois) {
            console.log("les deux nouveaux mots de passe ne sont pas les mêmes ");
        }

    } else if (!ancienMotDepasseSaisi) {
        console.log("Le mdp saisi n'est pas l'ancien");
    }



});

app.get('/HistoriqueDesEmprunts',(req,res)=>{

    res.render('HistoriqueEmprunts');
});

// FIN DE LA PARTIE DE MOHAMED WAFI
app.get('/recherche', (req, res) => {

    Livres.find({}, function (err, livres) {
        try {
            res.render("Recherche", { livresTab: livres, loginedUser: loginedUser })
        } catch (err) {
            console.log(err);
        }
    });

});

//livre
app.get('/livres/:isbn', (req, res) => {
    Livres.find({ ISBN: req.params.isbn }, function (err, donneesLivre) {
        try {
            res.render("Livres", { livre: donneesLivre, loginedUser: loginedUser })
        } catch (err) {
            console.log(err);
        }
    });
});

//page gestion
app.get('/gestion', async (req, res) => {
    Utilisateurs.find({}, function (err, utilisateurs) {
        try {
            Livres.find({}, function (err, livres) {
                try {
                    Emprunts.find({}, function (err, emprunts) {
                        try {
                            res.render('Gestion', { utilisateurs: utilisateurs, livres: livres, emprunts: emprunts, loginedUser: loginedUser });
                        } catch (err) {
                            res.status(450).end(err)
                        }
                    })
                } catch (err) {
                    res.status(450).end(err)
                }
            })
        } catch (err) {
            res.status(450).end(err)
        }
    })



});



app.listen(port, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", port);
});





