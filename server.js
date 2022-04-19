const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const Droits = require('./models/Droits');
const Emprunts = require('./models/Emprunts');
const Livres = require('./models/Livres');
const Reservations = require('./models/Reservations');
const Utilisateurs = require('./models/Utilisateurs');
const Transactions = require('./models/Transactions');
const path = require('path');
const axios = require('axios');
var cookieParser = require('cookie-parser');
var session = require('express-session');

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

// //Ceci est une variable globale qui va stocket le id de l'utilisateur connecté afin de permettre la modification de ses informations
// var idUserActuel;

app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser('secretcookie'))
app.use(session({
    name: "ssid",
    secret: "secretsession",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 },// Need to login after 30 min not use
    rolling: true
}))

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

// var loginedUser = null;
var listeLivresRetournes = new Array();


//page Acceuil
app.get('/', (req, res) => {
    res.render('Acceuil', { loginedUser: req.session.loginedUser });
});


//Page register and login
app.get('/login', async (req, res) => {
    res.render('login', { loginedUser: req.session.loginedUser });
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
            Droit_id: 0,
            Solde: 0
        }, function (err, newUser) {
            if (err) throw err;
            req.session.loginedUser = newUser
            console.log('Utilisateur cree')
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
        //set cookies
        //res.cookie('ID', userLogin._id, { maxAge: 10 * 1000 }, { signed: true })
        //set session
        req.session.loginedUser = userLogin;
        // loginedUser = userLogin;
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
    req.session.destroy();
    res.redirect("/")
})

// DÉBUT DE LA PARTIE DE MOHAMED WAFI
//TROUVER LE PROFIL D'UN USER ET AFFICHER LES EMPRUNTS- MOHAMED WAFI
app.get('/profil', (req, res) => {

    if (!req.session.loginedUser) {

        Emprunts.find({ Utilisateur_id: req.session.loginedUser }, function (err, livresEmpruntes) {
            //DÉBUT remplissage liste de livres empruntés à retourner

            //On parcoure les livres empruntés
            for (var z = 0; z < livresEmpruntes.length; z++) {
                // console.log("Les ID des livres empruntés par le user: " + livresEmpruntes[z].Livre_id)
                var DateDeRetour = livresEmpruntes[z].DateRetourPrevu
                var DateDePret = livresEmpruntes[z].DatePret
                //On prend ces id et on va chercher le livre au complet dans la table Livres
                Livres.find({ _id: livresEmpruntes[z].Livre_id }, function (err, ElementListeLivres) {

                    //On parcoure les livres avec les attributs au complet
                    for (var j = 0; j < ElementListeLivres.length; j++) {
                        // console.log("Les attributs au complet des livres empruntés: " + ElementListeLivres[j])

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


                        if (z == livresEmpruntes.length - 1) {
                            if (j == ElementListeLivres.length - 1) {
                                console.log(listeLivresRetournes)
                            }

                        }

                    }
                    //LE TABLEAU EST BEL ET BIEN REMPLI DES LIVRES QUE JE VEUX AFFICHER AVEC LES ATTRIBUTS (VOIR APP.GET MODIFIER) MAIS SA NE S'AFFICHE PAS ICI

                    //LE TABLEAU EST BEL ET BIEN REMPLI DES LIVRES QUE JE VEUX AFFICHER AVEC LES ATTRIBUTS (VOIR APP.GET MODIFIER) MAIS SA NE S'AFFICHE PAS ICI


                })


            }

            //res.render('Profil.ejs', { loginedUser: loginedUser, listeLivresRetournes: listeLivresRetournes })

            //FIN remplissage liste de livres empruntés à retourner
        });
        res.render('Profil.ejs', { loginedUser: req.session.loginedUser, listeLivresRetournes: listeLivresRetournes })
    } else {
        res.redirect('/login');
    }
});

//MISE À JOUR DES INFORMATIONS- MOHAMED WAFI
app.get('/Modifier', (req, res) => {
    //Correspond à l'ID de l'utilisateur connecté
    // idUserActuel = loginedUser._id;

    if (req.session.loginedUser) {
        res.render('ModifierProfil.ejs', { loginedUser: req.session.loginedUser })
    } else {
        res.redirect('/login');
    }

});

app.post('/Modifier', urlencodeParser, (req, res) => {


    //Lorsque le client finit de remplir le formulaire, il fait un post. Ce post va prendre les informations que le client a saisi
    //puis faire la mise à jour du compte utilisateur dans la BD mongo
    console.log(req.body.nomModifie);
    Utilisateurs.findOneAndUpdate({ _id: req.session.loginedUser }, {
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

//MISE À JOUR DU MOT DE PASSE- MOHAMED WAFI
app.get('/ModifierMotDePasse', (req, res) => {

    res.render('ModifierMotDePasse', { loginedUser: req.session.loginedUser })
});

app.post('/ModifierMotDePasse', urlencodeParser, (req, res) => {
    //Ce bout de code va permettre de savoir si le mot de passe "ancien" saisi par le client est bel
    //et bien celui du user connecté
    const ancienMotDepasseSaisi = require('bcrypt').compareSync(
        req.body.ancienMdp,
        req.session.loginedUser.Password
    )
    console.log("Voici l'ancien mot de passe du user" + req.session.loginedUser.Password);
    if (ancienMotDepasseSaisi) {
        console.log("Le mdp saisi est bel et bien l'ancien")
        if (req.body.nvxMdp == req.body.nvxMdpDeuxiemeFois) {
            console.log("les deux nouveaux mots de passe concordent ");

            //On dirait que ce code ne s'exécute pas, le mot de passe ne se met pas à jour
            Utilisateurs.findOneAndUpdate({ _id: req.session.loginedUser._id }, {
                Password: req.body.nvxMdp
            }, function (err, result) {
                if (err) { console(err) }
            });

            console.log("le mot de passe a été mis à jour")
            console.log("Nouveau mot de passe : " + req.session.loginedUser.Password);

            res.json("Le mot de passe a été mis à jour")
        } else if (req.body.nvxMdp != req.body.nvxMdpDeuxiemeFois) {
            console.log("les deux nouveaux mots de passe ne sont pas les mêmes ");
        }

    } else if (!ancienMotDepasseSaisi) {
        console.log("Le mdp saisi n'est pas l'ancien");
    }



});

app.get('/ajoutLivre', (req, res) => {
    //if(loginedUser!=null){
    //if(loginedUser.Droit_id=99){
    res.render("ajoutLivre");
    //}

    //}
});

app.post('/ajoutLivre', (req, res) => {
    //     var nouveauLivre = { Auteur: req. address: "Highway 37" };
    // Livres.insertOne(nouveauLivre ,function(err, res) {
    //     if (err) throw err;
    //     console.log("1 document inserted")

});



// FIN DE LA PARTIE DE MOHAMED WAFI

app.get('/recherche', (req, res) => {
    Livres.find({}, function (err, livres) {
        try {
            //console.log("Livre:", livres);
            res.render("Recherche", { livresTab: livres, loginedUser: req.session.loginedUser })
        } catch (err) {
            console.log(err);
        }
    });
});
app.post('/recherche', async (req, res) => {
    //Livres.find({Titre: {$regex: recherche}}, function(err,livres){
    Livres.find({ Titre: new RegExp(req.body.SearchInput, "i") }, function (err, livres) {
        if (err) throw err;
        console.log(livres)
        res.render("Recherche", { livresTab: livres, loginedUser: req.session.loginedUser })
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



app.get('/HistoriqueDesEmprunts', (req, res) => {

    res.render('HistoriqueEmprunts');
});


app.get('/recherche', (req, res) => {

    Livres.find({}, function (err, livres) {
        if (err) throw err;
        res.render("Recherche", { livresTab: livres, loginedUser: req.session.loginedUser })
    });
});

//livre
app.get('/livres/:isbn', (req, res) => {
    Livres.find({ ISBN: req.params.isbn }, function (err, donneesLivre) {
        if (err) throw err;
        res.render("Livres", { livre: donneesLivre, loginedUser: req.session.loginedUser })
    });
});


app.post('/livres/:isbn', (req, res) => {
    if (loginedUser == null) res.redirect("/login")
    else {
        Reservations.findOne({ Livre_id: req.body.livre_id, Utilisateur_id: req.session.loginedUser._id }, function (err, livre) {
            if (livre == null && req.body.livre_NbDisponible > 0) {
                const date = Date.now()
                const livreReservee = new Reservations(
                    {
                        DateReservation: date,
                        Livre_id: req.body.livre_id,
                        Utilisateur_id: req.session.loginedUser._id
                    }
                );
                livreReservee.save(function (err) {
                    if (err) console.log(err)
                    console.log("Le livre: " + req.body.livre_Titre + " a ete reserve")
                });
                Livres.findByIdAndUpdate(req.body.livre_id, { NbDisponible: req.body.livre_NbDisponible - 1 },
                    function (err, livre) {
                        if (err) {
                            console.log(err);
                        }
                    })
            } else console.log("Le livre: " + req.body.livre_Titre + " ne peut pas etre reserve")
        })
    }


    //res.render("Reservations", livreReservee)
    // if user is not logged in, redirect him to the login page 
    // -from the book page if the available amount is zero in the desc then disable the button or send a message
});

app.get('/reservations', (req, res) => {
    if (!req.session.loginedUser) res.redirect("/login")
    Reservations.find({ Utilisateur_id: req.session.loginedUser._id }, function (err, lesRes) {
        if (err) console.log(err)
        Livres.find({}, function (err, donneesLivre) {
            if (err) console.log(err)
            res.render("Reservations", { resInfo: lesRes, livres: donneesLivre, loginedUser: req.session.loginedUser })
        });
    });
});

//page gestion
app.get('/gestion', async (req, res) => {
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {//only for admin or staff
            res.render('Gestion', { loginedUser: req.session.loginedUser });
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }





    // console.log(req.signedCookies.ID)
    // Utilisateurs.findById(req.signedCookies.ID, function (err, utilisateur) {
    //     if (err) throw err;
    //     if (utilisateur != null) {
    //         if (utilisateur.Droit_id == 99 || utilisateur.Droit_id == 1) {//only for admin or staff
    //             res.render('Gestion', { loginedUser: utilisateur });
    //         } else {
    //             res.status(403).end("vous n'avez pas le droit")
    //         }
    //     } else {
    //         res.redirect("/login")
    //     }
    // })

    // if (loginedUser != null) {
    //     if (loginedUser.Droit_id == 99 || loginedUser.Droit_id == 1) {//only for admin or staff
    //         res.render('Gestion', { loginedUser: loginedUser });
    //     } else {
    //         res.status(403).end("vous n'avez pas le droit")
    //     }
    // } else {
    //     res.redirect("/login")
    // }
});

//emprunt du livre
app.get('/gestion/empruntretour', (req, res) => {
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {//only for admin or staff
            res.render('empruntretour', { loginedUser: req.session.loginedUser })
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
})

app.post('/gestion/empruntretour', async (req, res) => {
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {//only for admin or staff
            // if (req.body.option == "RechercheClient") {//button clicked = RechercheClient
            //     Utilisateurs.find({ Telephone: req.body.telClient }, function (err, client) {
            //         if (err) throw err;
            //         Emprunts.find({ Utilisateur_id: client[0]._id }, function (err, historique) {
            //             if (err) throw err;
            //             Livres.find({}, function (err, livres) {
            //                 if (err) throw err;
            //                 res.render('EmpruntRetour', { loginedUser: req.session.loginedUser, client: client, emprunts: historique, livres: livres })
            //             })
            //         })
            //     });
            // }

            //if (req.body.option == "EmpruntRetour") {//button clicked = EmpruntLivre
                Livres.findOne({ ISBN: req.body.isbnLivre }, function (err, livre) {
                    if (err) throw err;
                    if (livre == null) {
                        return res.send(JSON.stringify({'message' : 'Livre non existe'}));
                        //return res.status(403).end("Livre non existe")
                    } else {
                        Emprunts.find({
                            Livre_id: livre._id,
                            Utilisateur_id: req.body.clientEmprunt
                        }, function (err, emprunts) {
                            if (err) throw err;
                            if (req.body.choix == "radioEmprunt") {
                                var islivreRetour = true;
                                emprunts.forEach(emprunt => {
                                    if (emprunt.DateRetour == null) {
                                        islivreRetour = false;
                                    }
                                })
                                if (!islivreRetour) {//user already borrowed this book
                                    //return res.status(403).end("user already borrowed this book")
                                    return res.send(JSON.stringify({'message' : 'user already borrowed this book'}));
                                } else {
                                    Utilisateurs.findOne({ _id: req.body.clientEmprunt }, function (err, utilisateur) {
                                        if (err) throw err;
                                        if (utilisateur.NbPret >= utilisateur.MaxPret) {
                                            //return res.status(403).end("client attend au maximun du pret ")
                                            return res.send(JSON.stringify({'message' : 'client attend au maximun du pret'}));
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
                                                //res.status(403).end("livre non disponible")
                                                return res.send(JSON.stringify({'message' : 'livre non disponible'}));
                                            } else {

                                                utilisateur.updateOne({ //update nombre de pret du utilisateur
                                                    NbPret: utilisateur.NbPret + 1
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
                                                    //res.redirect("/gestion/empruntretour")
                                                    return res.send(JSON.stringify({'message' : 'Emprunt reussi'}));
                                                })
                                            }
                                        }
                                    })
                                }
                            }//end of radioEmprunt

                            if (req.body.choix == "radioRetour" || req.body.choix == "radioPerdu") {
                                var compte = 0;
                                emprunts.forEach(emprunt => {

                                    if (emprunt.DateRetour == null) {
                                        compte++;
                                        //supose d'avoir un seule resultat (Un même livre ne peut pas prêter 2 copies à un personne. )
                                        if (req.body.choix == "radioPerdu") {
                                            emprunt.updateOne({
                                                EstPerdu: true
                                            }, function (err) {
                                                if (err) throw err;
                                            })
                                        }

                                        emprunt.updateOne({
                                            DateRetour: new Date(Date.now())
                                        }, function (err) {
                                            if (err) throw err;

                                            if (req.body.choix == "radioRetour") {
                                                //modification du livre disponible
                                                var livreNbDisponible = livre.NbDisponible;
                                                livre.updateOne({
                                                    NbDisponible: livreNbDisponible + 1
                                                }, function (err) {
                                                    if (err) throw err;
                                                })
                                            }

                                            //charge le frais du retard
                                            var fraisRetard = 0;
                                            retard = new Date(Date.now()) - emprunt.DateRetourPrevu
                                            if (retard > 0) {
                                                retard = Math.floor(retard / (1000 * 3600 * 24))
                                                fraisRetard = retard * 0.5// 0.5$ par jour
                                                if (fraisRetard > 10) {
                                                    fraisRetard = 10;//maximum 10$ pour le retard
                                                }
                                                fraisRetard = -fraisRetard; //Tous les charge du clients sont au negative                                            
                                                Transactions.create({
                                                    DateTransaction: new Date(Date.now()),
                                                    MethodePaiement: null,
                                                    Cout: fraisRetard,
                                                    Utilisateur_id: req.body.clientEmprunt,
                                                    EmployeeId: req.session.loginedUser._id,
                                                    Commentaire: "Frais du retard pour le livre: " + livre.Titre + ", " + livre.Auteur + ", " + livre.ISBN
                                                }, function (err) { if (err) throw err })
                                            }
                                            //charge le cout du livre
                                            var cout = 0;
                                            if (req.body.choix == "radioPerdu") {
                                                cout = -livre.Cout;
                                                Transactions.create({
                                                    DateTransaction: new Date(Date.now()),
                                                    MethodePaiement: null,
                                                    Cout: cout,
                                                    Utilisateur_id: req.body.clientEmprunt,
                                                    EmployeeId: req.session.loginedUser._id,
                                                    Commentaire: "Frais pour la pert du livre: " + livre.Titre + ", " + livre.Auteur + ", " + livre.ISBN
                                                }, function (err) { if (err) throw err })
                                            }

                                            //modification nombre pret d'utilisateur
                                            Utilisateurs.findOne({ _id: req.body.clientEmprunt }, function (err, utilisateur) {
                                                if (err) throw err;
                                                var nbpret = utilisateur.NbPret
                                                var solde = (utilisateur.Solde + cout + fraisRetard).toFixed(2)
                                                utilisateur.updateOne({
                                                    NbPret: nbpret - 1,
                                                    Solde: solde
                                                }, function (err) {
                                                    if (err) throw err;
                                                })
                                            })
                                            if (req.body.choix == "radioRetour") {
                                                return res.send(JSON.stringify({'message' : 'Retour réussi'}));
                                            }
                                            if (req.body.choix == "radioPerdu") {
                                                return res.send(JSON.stringify({'message' : 'Livre perdu traité'}));
                                            }
                                            //res.redirect("/gestion/empruntretour")
                                        })
                                    }

                                })//end foreach
                                if (compte == 0) {
                                    //res.status(403).end("Pas de enrigistement")
                                    return res.send(JSON.stringify({'message' : 'Pas de enrigistement'}));
                                }

                            }//end of radioRetour and radioPerdu

                        })// end of emprunt


                    }//end of if livre existe


                });

            //}
        } else {
            return res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        return res.redirect("/login")
    }
})

//ajax axios
app.post('/findCustomer', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {
            Utilisateurs.findOne({ Telephone: req.body.tel }, function (err, client) {
                if (err) throw err;
                if (client) {
                    Emprunts.find({ Utilisateur_id: client._id }, function (err, historique) {
                        if (err) throw err;
                        Livres.find({}, function (err, livres) {
                            if (err) throw err;
                            let data = { client, historique, livres }
                            res.send(JSON.stringify(data))
                        })
                    })
                } else{
                    res.send(JSON.stringify({'message' : 'Client not exist'}));
                }

            })
        } else {
            res.status(403).end("Forbidden")
        }
    } else {
        res.redirect("/login")
    }

})


// app.post('/findCustomer', (req, res) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', '*');//option,all

//     Utilisateurs.find({ Telephone: req.body.telClient }, function (err, client) {
//         if (err) throw err;
//         res.render('EmpruntRetour', { client: client })
//     })

// })

app.get('/gestion/transactions', async (req, res) => {
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {
            res.render('Transactions', { loginedUser: req.session.loginedUser });
        }
    } else {
        res.redirect('/login');
    }
});

app.get('/gestion/client', (req, res) => {
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {//only for admin or staff
            let client = null;
            res.render('GestionClient', { loginedUser: req.session.loginedUser, client: client })
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
})





app.listen(port, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", port);
});





