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
const { title } = require('process');
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
var listeLivresRetournes= new ArrayList();




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

        //verify if user exist
        const userSignUpEmail = await Utilisateurs.findOne({
            Email: dataReceived.signUpEmail
        })
        const userSignUpTel = await Utilisateurs.findOne({
            Telephone: dataReceived.signUpTel
        })
        if (userSignUpEmail || userSignUpTel) {
            return res.status(422).end('Utilisateur existe')
        }

        //prepare all data need to create a new user                         
        const rand = Math.floor(Math.random() * 12) + 1;//random un image de profil
        //put new user data to mongodb  
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
        }, function (err, newUser) {
            if (err) throw err;
            console.log('Utilisateur cree')
            loginedUser = newUser;
            res.redirect('/');
        })
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
            case 0:
                res.redirect("/profil")
                break;
            case 1:
            case 99:
                res.redirect("/gestion")
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



//TROUVER LE PROFIL D'UN USER ET AFFICHER LES EMPRUNTS- MOHAMED WAFI
app.get('/profil', (req, res) => {


    if (loginedUser != null) {

        Emprunts.find({ Utilisateur_id: loginedUser._id }, function (err, livresEmpruntes) {
            //DÉBUT remplissage liste de livres empruntés à retourner

            //On parcoure les livres empruntés
            for (var z = 0; z < livresEmpruntes.length; z++) {
                console.log("Les ID des livres empruntés par le user: " + livresEmpruntes[z].Livre_id)
                var DateDeRetour = livresEmpruntes[z].DateRetourPrevu
                var DateDePret = livresEmpruntes[z].DatePret
                //On prend ces id et on va chercher le livre au complet dans la table Livres
                Livres.find({ _id: livresEmpruntes[z].Livre_id }, function (err, ElementListeLivres) {

                    //On parcoure les livres avec les attributs au complet
                    for (var j = 0; j < ElementListeLivres.length; j++) {
                        console.log("Les attributs au complet des livres empruntés: " + ElementListeLivres[j])

                        //Déclaration des éléments à afficher sur la page
                        var Titre = ElementListeLivres[j].Titre;
                        var ISBN = ElementListeLivres[j].ISBN;
                        var Auteur = ElementListeLivres[j].Auteur;

                        //Déclaration de l'objet livre à afficher sur la page profil
                        let livreAfficher = {
                            titre: Titre,
                            isbn: ISBN,
                            dateRetour: DateDeRetour,
                            datePret: DateDePret,
                            auteur: Auteur
                        }
                        //On ajoute ce livre dans la liste des livres à afficher
                        listeLivresRetournes.push(livreAfficher);
                    }


                //LE TABLEAU EST BEL ET BIEN REMPLI DES LIVRES QUE JE VEUX AFFICHER AVEC LES ATTRIBUTS (VOIR APP.GET MODIFIER) MAIS SA NE S'AFFICHE PAS ICI
                res.render('Profil.ejs', { loginedUser: loginedUser, listeLivresRetournes: listeLivresRetournes })
                
                })
            }

            //FIN remplissage liste de livres empruntés à retourner



        });


    } else {
        res.redirect('/login');
    }

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


app.get('/recherche', (req, res) => {

 

Livres.find({}, function(err,livres){
    try{
        //console.log("Livre:", livres);
        res.render("Recherche", {livresTab:livres})
    }catch(err){
        console.log(err);
    }
});        

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
        //Photo: req.body.photoModifie

    }, function (err, result) {
        if (err) { console(err) }
    });


    console.log("Utilisateur mis à jour")
    res.redirect('/')



});
app.post('/recherche', async (req, res) => {
    //Livres.find({Titre: {$regex: recherche}}, function(err,livres){
    Livres.find({ Titre: new RegExp(req.body.SearchInput, "i") }, function (err, livres) {
        if (err) throw err;
        console.log(livres)
        res.render("Recherche", { livresTab: livres })
    });
});//end of post

/* app.post('/recherche', async (req, res) => {
    var recherche =  {$regex:req.body.SearchInput};
     Titre.toLowerCase(); 
    //Titre = Titre.toLowerCase();
    //recherche = recherche.toLowerCase();
//Livres.find({Titre: {$regex : {$regex:req.body.SearchInput} }}, function(err,livres){
    Livres.find({Titre: {$regex:recherche}}, function(err,livres){
        try{
             if(Livres.Titre.localeCompare(recherche, { sensitivity: 'accent' }))
            { 
            console.log(livres)
            res.render("Recherche", {livresTab:livres})
             } 
        }catch(err){
            console.log(err);
        }
    });
   
   
});//end of post */


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
    console.log("Voici l'ancien mot de passe du user" + loginedUser.Password);
    if (ancienMotDepasseSaisi) {
        console.log("Le mdp saisi est bel et bien l'ancien")
        if (req.body.nvxMdp == req.body.nvxMdpDeuxiemeFois) {
            console.log("les deux nouveaux mots de passe concordent ");

            //On dirait que ce code ne s'exécute pas, le mot de passe ne se met pas à jour
            Utilisateurs.findOneAndUpdate({ _id: loginedUser._id }, {
                Password: req.body.nvxMdp
            }, function (err, result) {
                if (err) { console(err) }
            });

            console.log("le mot de passe a été mis à jour")
            console.log("Nouveau mot de passe : " + loginedUser.Password);

            res.json("Le mot de passe a été mis à jour")
        } else if (req.body.nvxMdp != req.body.nvxMdpDeuxiemeFois) {
            console.log("les deux nouveaux mots de passe ne sont pas les mêmes ");
        }

    } else if (!ancienMotDepasseSaisi) {
        console.log("Le mdp saisi n'est pas l'ancien");
    }



});

app.get('/HistoriqueDesEmprunts', (req, res) => {

    res.render('HistoriqueEmprunts');
});

// FIN DE LA PARTIE DE MOHAMED WAFI
app.get('/recherche', (req, res) => {

    Livres.find({}, function (err, livres) {
        if (err) throw err;
        res.render("Recherche", { livresTab: livres, loginedUser: loginedUser })
    });
});

//livre
app.get('/livres/:isbn', (req, res) => {
    Livres.find({ ISBN: req.params.isbn }, function (err, donneesLivre) {
        if (err) throw err;
        res.render("Livres", { livre: donneesLivre, loginedUser: loginedUser })
    });
});


//page gestion
app.get('/gestion', async (req, res) => {
    if (loginedUser != null) {
        if (loginedUser.Droit_id == 99 || loginedUser.Droit_id == 1) {//only for admin or staff
            res.render('Gestion', { loginedUser: loginedUser });
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
});

//emprunt du livre
app.get('/gestion/empruntretour', (req, res) => {
    if (loginedUser != null) {
        if (loginedUser.Droit_id == 99 || loginedUser.Droit_id == 1) {//only for admin or staff
            let client = null;
            res.render('empruntretour', { loginedUser: loginedUser, client: client })
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
})

app.post('/gestion/empruntretour', async (req, res) => {
    if (loginedUser != null) {
        if (loginedUser.Droit_id == 99 || loginedUser.Droit_id == 1) {//only for admin or staff
            if (req.body.option == "RechercheClient") {//button clicked = RechercheClient
                Utilisateurs.find({ Telephone: req.body.telClient }, function (err, client) {
                    if (err) throw err;
                    Emprunts.find({ Utilisateur_id: client[0]._id }, function (err, historique) {
                        if (err) throw err;
                        Livres.find({}, function (err, livres) {
                            if (err) throw err;
                            res.render('EmpruntRetour', { loginedUser: loginedUser, client: client, emprunts: historique, livres: livres })
                        })
                    })


                });
            }
            if (req.body.option == "EmpruntRetour") {//button clicked = EmpruntLivre
                Livres.findOne({ ISBN: req.body.isbnLivre }, function (err, livre) {
                    if (req.body.choix == "radioEmprunt") {
                        if (err) throw err;
                        var islivreRetour = true;
                        Emprunts.find({
                            Livre_id: livre._id,
                            Utilisateur_id: req.body.clientEmprunt
                        }, function (err, records) {
                            if (err) throw err;
                            records.forEach(record => {
                                if (record.DateRetour == null) {
                                    islivreRetour = false;
                                }
                            })
                            if (!islivreRetour) {//user already borrowed this book
                                return res.status(403).end("user already borrowed this book")
                            } else {
                                Utilisateurs.findOne({ _id: req.body.clientEmprunt }, function (err, client) {
                                    if (err) throw err;
                                    if (client.NbPret >= client.MaxPret) {
                                        return res.status(403).end("client attend au maximun du pret ")
                                    } else {
                                        //verify if the book is already in reservation
                                        Reservations.findOneAndDelete({
                                            Livre_id: livre._id,
                                            Utilisateur_id: req.body.clientEmprunt
                                        }, function (err) {
                                            if (err) throw err;
                                            var livreNbDisponible = livre.NbDisponible;
                                            livre.updateOne({ //update nombre disponible du livre apres annuler le reservation
                                                NbDisponible: livreNbDisponible + 1
                                            }, function (err) {
                                                if (err) throw err;
                                            })
                                        })

                                        if (livre.NbDisponible <= 0) {
                                            res.status(403).end("livre non disponible")
                                        } else {

                                            client.updateOne({ //update nombre de pret du utilisateur
                                                NbPret: client.NbPret + 1
                                            }, function (err) {
                                                if (err) throw err;
                                            })

                                            var livreNbDisponible = livre.NbDisponible;
                                            livre.updateOne({ //update nombre disponible du livre
                                                NbDisponible: livreNbDisponible - 1
                                            }, function (err) {
                                                if (err) throw err;
                                            })

                                            //put information into database               
                                            Emprunts.create({
                                                DatePret: new Date(Date.now()),
                                                DateRetourPrevu: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                                                DateRetour: null,
                                                Livre_id: livre._id,
                                                Utilisateur_id: req.body.clientEmprunt
                                            }, function (err) {
                                                if (err) throw err;
                                                // return res.status(403).end("reussi")
                                                res.redirect("/gestion/empruntretour")
                                            })
                                        }
                                    }
                                })
                            }
                        })
                    }
                    if (req.body.choix == "radioRetour") {
                        Emprunts.find({
                            Livre_id: livre._id,
                            Utilisateur_id: req.body.clientEmprunt
                        }, function (err, records) {
                            if (err) throw err;
                            var compte = 0;
                            records.forEach(record => {
                                if (record.DateRetour == null) {
                                    compte++;
                                    //supose d'avoir un resultat
                                    record.updateOne({
                                        DateRetour: new Date(Date.now())
                                    }, function (err) {
                                        if (err) throw err;
                                        //modification nombre disponible
                                        Livres.findOne({ _id: livre._id }, function (err, resultat) {
                                            if (err) throw err;
                                            var livreNbDisponible = resultat.NbDisponible;
                                            resultat.updateOne({
                                                NbDisponible: livreNbDisponible + 1
                                            }, function (err) {
                                                if (err) throw err;
                                            })
                                        })
                                        //modification nombre pret d'utilisateur
                                        Utilisateurs.findOne({ _id: req.body.clientEmprunt }, function (err, utilisateur) {
                                            if (err) throw err;
                                            var nbpret = utilisateur.NbPret
                                            utilisateur.updateOne({
                                                NbPret: nbpret - 1
                                            }, function (err) {
                                                if (err) throw err;
                                            })
                                        })
                                        res.redirect("/gestion/empruntretour")
                                    })
                                }

                            })//end foreach
                            if (compte == 0) {
                                res.status(403).end("Pas de enrigistement")
                            }
                        })
                    }
                });

            }
        } else {
            return res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        return res.redirect("/login")
    }
})





app.listen(port, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", port);
});





