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
var http = require("http");
var fs = require('fs');
var formidable = require('formidable');

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

app.listen(port, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", port);

});

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

// ce code permet d'afficher les historique des emprunts de l'utilisateur connecté
app.get('/HistoriqueDesEmprunts', (req, res) => {
    if (req.session.loginedUser) {
        Emprunts.find({ Utilisateur_id: req.session.loginedUser }).sort({ DatePret: 'desc' }).exec(function (err, livresEmpruntes) {
            if (err) {
                res.json("erreur")
            }
            Livres.find({}, function (err, livresInfos) {
                if (err) {
                    res.json("erreur")
                }
                res.render('HistoriqueEmprunts.ejs', { loginedUser: req.session.loginedUser, livresEmpruntes: livresEmpruntes, livresInfos: livresInfos })
            })

        })
    } else {
        res.redirect("/login")
    }
})

// affiche le profil de l'utilisateur connecté
app.get('/profil', (req, res) => {
    if (req.session.loginedUser) {
        res.render('Profil.ejs', { loginedUser: req.session.loginedUser })
    } else {
        res.redirect('/login');
    }

});


//MISE À JOUR DES INFORMATIONS DE L'UTILISATEUR CONNECTÉ- MOHAMED WAFI
app.get('/Modifier', (req, res) => {
    if (req.session.loginedUser) {
        res.render('ModifierProfil.ejs', { loginedUser: req.session.loginedUser })
    } else {
        res.redirect('/login');
    }

});

//Lorsque le client finit de remplir le formulaire, il fait un post. Ce post va prendre les informations que le client a saisi
//puis faire la mise à jour du compte utilisateur dans la BD mongo
app.post('/Modifier', urlencodeParser, (req, res) => {
    Utilisateurs.findOne({Telephone: req.body.telephoneModifie}, function(err, utilisateurtel){
        if (err) throw err;
        if (utilisateurtel){
            if (utilisateurtel._id != req.session.loginedUser._id){
                return res.status(403).end("Numero de teiephone deja existant")
            } else {
                Utilisateurs.findOne({Email: req.body.emailModifie}, function(err, utilisateureml){
                    if (err) throw err;
                    if (utilisateureml){
                        if (utilisateureml._id != req.session.loginedUser._id){
                            return res.status(403).end("Email deja existant")
                        } else{
                            Utilisateurs.findOneAndUpdate({ _id: req.session.loginedUser }, {
                                Nom: req.body.nomModifie,
                                Prenom: req.body.prenomModifie,
                                Telephone: req.body.telephoneModifie,
                                Email: req.body.emailModifie,
                            }, function (err) {
                                if (err) { throw (err) }
                            });
                            res.redirect('/')
                        }
                    } else{
                        Utilisateurs.findOneAndUpdate({ _id: req.session.loginedUser }, {
                            Nom: req.body.nomModifie,
                            Prenom: req.body.prenomModifie,
                            Telephone: req.body.telephoneModifie,
                            Email: req.body.emailModifie,
                        }, function (err) {
                            if (err) { throw (err) }
                        });
                        res.redirect('/')
                    }
                })
            }
        } else {
            Utilisateurs.findOne({Email: req.body.emailModifie}, function(err, utilisateureml){
                if (err) throw err;
                if (utilisateureml){
                    if (utilisateureml._id != req.session.loginedUser._id){
                        return res.status(403).end("Email déjà existant")
                    } else{
                        Utilisateurs.findOneAndUpdate({ _id: req.session.loginedUser }, {
                            Nom: req.body.nomModifie,
                            Prenom: req.body.prenomModifie,
                            Telephone: req.body.telephoneModifie,
                            Email: req.body.emailModifie,
                        }, function (err) {
                            if (err) { throw (err) }
                        });
                        res.redirect('/')
                    }
                } else{
                    Utilisateurs.findOneAndUpdate({ _id: req.session.loginedUser }, {
                        Nom: req.body.nomModifie,
                        Prenom: req.body.prenomModifie,
                        Telephone: req.body.telephoneModifie,
                        Email: req.body.emailModifie,
                    }, function (err) {
                        if (err) { throw (err) }
                    });
                    res.redirect('/')
                }
            })
        }
    })  
});

//Modifier image de profil
app.post('/ModifierPhotoProfil', urlencodeParser, (req, res) => {
    var uploadProfilPhotoPath = "./public/Images/Profil/";
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) throw err
        var oldPath = files.photoModifie.filepath;
        var newName = req.session.loginedUser._id + path.extname(files.photoModifie.originalFilename);
        var newPath = uploadProfilPhotoPath + newName;
        fs.rename(oldPath, newPath, function (err) {
            if (err) throw err;
            //update database
            Utilisateurs.findOneAndUpdate({ _id: req.session.loginedUser }, {
                Photo: "/Images/Profil/" + newName
            }, function (err) {
                if (err) { throw(err) }
            });
            res.redirect('/Modifier');
        });
    });
});

//MISE À JOUR DU MOT DE PASSE- MOHAMED WAFI
app.get('/ModifierMotDePasse', (req, res) => {
    res.render('ModifierMotDePasse', { loginedUser: req.session.loginedUser })
});

//Modification du mot de passe
app.post('/ModifierMotDePasse', urlencodeParser, (req, res) => {
    //Ce bout de code va permettre de savoir si le mot de passe "ancien" saisi par le client est bel
    //et bien celui du user connecté
    const ancienMotDepasseSaisi = require('bcrypt').compareSync(
        req.body.ancienMdp,
        req.session.loginedUser.Password
    )
    if (ancienMotDepasseSaisi) {
        if (req.body.nvxMdp == req.body.nvxMdpDeuxiemeFois) {
            Utilisateurs.findOneAndUpdate({ _id: req.session.loginedUser._id }, {
                Password: req.body.nvxMdp
            }, function (err, result) {
                if (err) { throw(err) }
            });
            return res.send(JSON.stringify({ 'message': "le mot de passe a été mis à jour", 'code': 20 }))

        } else if (req.body.nvxMdp != req.body.nvxMdpDeuxiemeFois) {
            return res.send(JSON.stringify({ 'message': "les deux nouveaux mots de passe ne sont pas les mêmes " }))
        }

    } else if (!ancienMotDepasseSaisi) {
        return res.send(JSON.stringify({ 'message': "Le mdp saisi n'est pas l'ancien" }))
    }

});

// FIN DE LA PARTIE DE MOHAMED WAFI
// ce code permet d'afficher tout les livres dans la bibliotheque
app.get('/recherche', (req, res) => {
    Livres.find({}, function (err, livres) {
        if (err) throw err;
        res.render("Recherche", { livresTab: livres, loginedUser: req.session.loginedUser })
    });
});

// ce code permet d'afficher tout les livres recherchés dans la bibliotheque
app.post('/recherche', async (req, res) => {
    Livres.find({ Titre: new RegExp(req.body.SearchInput, "i") }, function (err, livres) {
        if (err) throw err;
        res.render("Recherche", { livresTab: livres, loginedUser: req.session.loginedUser })
    });
});

//affiche les info d'un livre avec le isbn
app.get('/livres/:isbn', (req, res) => {
    Livres.findOne({ ISBN: req.params.isbn }, function (err, donneesLivre) {
        if (err) throw err;
        res.render("Livres", { livre: donneesLivre, loginedUser: req.session.loginedUser })
    });
});

// reserver un livre a partir de la page du livre
app.post('/livres/:isbn', (req, res) => {
    if (req.session.loginedUser == null) {
        return res.send(JSON.stringify({ 'message': "Il faut se connecter pour utiliser cette fonction", 'code': 10 }));
    } else {

        Livres.findOne({ ISBN: req.body.isbn }, function (err, livre) {
            if (err) throw err;
            if (livre == null) {
                return res.send(JSON.stringify({ 'message': "Livre n'existe pas" }))
            } else {
                var userID = req.body.client_id;
                if (!req.body.client_id) {
                    userID = req.session.loginedUser._id
                }
                Reservations.findOne({ Livre_id: livre._id, Utilisateur_id: userID }, function (err, reservation) {
                    var nbDisponible = livre.NbDisponible
                    if (reservation == null && nbDisponible > 0) {
                        const date = new Date(Date.now())
                        const livreReservee = new Reservations(
                            {
                                DateReservation: date,
                                Livre_id: livre._id,
                                Utilisateur_id: userID
                            }
                        );
                        livreReservee.save(function (err) {
                            if (err) console.log(err)
                            return res.send(JSON.stringify({ 'message': "Le livre: " + livre.Titre + " a été reservé par " + req.session.loginedUser.Nom }));
                        });
                        Livres.findByIdAndUpdate(livre._id, { NbDisponible: nbDisponible - 1 },
                            function (err, livre) {
                                if (err) {
                                    throw err
                                }
                            })
                    } else return res.send(JSON.stringify({ 'message': "Le livre: " + livre.Titre + " ne peut pas être réservé" }));
                })
            }
        })
    }
});


// montre la reservation fait par l'utilisateur connecté
app.get('/reservations', (req, res) => {
    if (!req.session.loginedUser) return res.redirect("/login")
    Reservations.find({ Utilisateur_id: req.session.loginedUser._id }).sort({ DateReservation: 'desc' }).exec(function (err, lesRes) {
        if (err) throw (err)
        Livres.find({}, function (err, donneesLivre) {
            if (err) console.log(err)
            res.render("Reservations", { resInfo: lesRes, livres: donneesLivre, loginedUser: req.session.loginedUser })
        });
    });
});

// annule un reservation choisi par l'utilisateur connecté
app.post('/annulerReservation', (req, res) => {
    if (!req.session.loginedUser) return res.redirect("/login")
    else {
        var user_id;
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {
            user_id = req.body.user_id
        } else {
            user_id = req.session.loginedUser._id;
        }
        if (req.body.reservation_id) {
            Reservations.findByIdAndDelete(req.body.reservation_id, function (err) {
                if (err) console.log(err)
            })
            Livres.findByIdAndUpdate(req.body.livre_id, { NbDisponible: parseInt(req.body.livre_NbDisponible) + 1 }, function (err) {
                if (err) console.log(err)
            })
        } else {
            Reservations.findOneAndDelete({ Livre_id: req.body.livre_id, Utilisateur_id: user_id }, function (err, livre) {
                if (err) console.log(err)
                if (livre) {
                    Livres.findByIdAndUpdate(req.body.livre_id, { NbDisponible: parseInt(req.body.livre_NbDisponible) + 1 }, function (err) {
                        if (err) console.log(err)
                    })
                }
            })
        }
        res.redirect(req.headers.referer)
    }
});

// permet d'afficher les transaction de l'utilisateur connecté et de le telecharger la facture en format pdf
app.get('/transactions', (req, res) => {
    if (!req.session.loginedUser) return res.redirect("/login")
    Transactions.find({ Utilisateur_id: req.session.loginedUser._id }).sort({ DateTransaction: 'desc' }).exec(function (err, transactions) {
        if (err) throw (err)
        res.render("Transactions", { transactions: transactions, loginedUser: req.session.loginedUser })
    });
});


// *** TOUT LES FONCTIONNALITÉS DANS LA PARTIE QUI SUIT ET QUI CONTIENT LE MOT GESTION ***
// *** PEUT SEULEMENT ETRE EFFECTUÉ PAR UN ADMIN OU UN EMPLOYÉES *************************


//affiche la page de gestion et les fonctionnalité qui vient avec
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
});

// affiche la page d'emprunt d'un livre
app.get('/gestion/empruntretour', (req, res) => {
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {//only for admin or staff
            res.render('GestionEmpruntRetour', { loginedUser: req.session.loginedUser })
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
})

// effectue l'emprunt, le retour et la perte d'un livre
// par la suite, si necessaire il le charge au client

app.post('/gestion/empruntretour', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {//only for admin or staff
            Livres.findOne({ ISBN: req.body.isbnLivre }, function (err, livre) {
                if (err) throw err;
                if (livre == null) {
                    return res.send(JSON.stringify({ 'message': 'Livre non existe' }));
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
                            if (!islivreRetour) {
                                return res.send(JSON.stringify({ 'message': 'le livre a déjà été emorunté par ce client' }));
                            } else {
                                Utilisateurs.findOne({ _id: req.body.clientEmprunt }, function (err, utilisateur) {
                                    if (err) throw err;
                                    if (utilisateur.NbPret >= utilisateur.MaxPret) {
                                        return res.send(JSON.stringify({ 'message': 'le client à déjà atteint le nombre de prêt maximal' }));
                                    } else {
                                        //mis a jour le nombre de livre
                                        var livreNbDisponible = livre.NbDisponible;
                                        //verfie si le livre est deja reservé
                                        Reservations.findOne({
                                            Livre_id: livre._id,
                                            Utilisateur_id: req.body.clientEmprunt
                                        }, function (err, reservation) {
                                            if (err) throw err;
                                            if (reservation){
                                                Reservations.deleteOne({_id: reservation._id}, function (err){
                                                    if (err) throw err; 
                                                    utilisateur.updateOne({ //met a jour le nombre de pret de l'utilisateur
                                                        NbPret: utilisateur.NbPret + 1
                                                    }, function (err) {
                                                        if (err) throw err;
                                                    })
                    
                                                    // insert les informations dans la bd             
                                                    Emprunts.create({
                                                        DatePret: new Date(Date.now()),
                                                        DateRetourPrevu: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                                                        DateRetour: null,
                                                        Livre_id: livre._id,
                                                        Utilisateur_id: req.body.clientEmprunt
                                                    }, function (err) {
                                                        if (err) throw err;
                                                    })
                                                    return res.send(JSON.stringify({ 'message': 'Emprunt reussi' }));


                                                })
                                            } else {
                                                if (livre.NbDisponible <= 0) {
                                                    return res.send(JSON.stringify({ 'message': 'livre non disponible' }));
                                                } else{
                                                    livre.updateOne({ //met a jour le nombre disponible d'un livre apres l'annulation d'un reservation, mais seulement si elle existe
                                                        NbDisponible: livreNbDisponible - 1
                                                    }, function (err) {
                                                        if (err) throw err;
                                                    })
                                                    utilisateur.updateOne({ //met a jour le nombre de pret de l'utilisateur
                                                        NbPret: utilisateur.NbPret + 1
                                                    }, function (err) {
                                                        if (err) throw err;
                                                    })
                    
                                                    // insert les informations dans la bd             
                                                    Emprunts.create({
                                                        DatePret: new Date(Date.now()),
                                                        DateRetourPrevu: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                                                        DateRetour: null,
                                                        Livre_id: livre._id,
                                                        Utilisateur_id: req.body.clientEmprunt
                                                    }, function (err) {
                                                        if (err) throw err;
                                                    })
                                                    return res.send(JSON.stringify({ 'message': 'Emprunt reussi' }));
                                                }
                                            } 
                                        })
                                    }
                                })
                            }
                        }//fin de radioEmprunt

                        if (req.body.choix == "radioRetour" || req.body.choix == "radioPerdu") {
                            var compte = 0;
                            emprunts.forEach(emprunt => {
                                if (emprunt.DateRetour == null) {
                                    compte++;
                                    //suppose d'avoir un seule resultat (Un même livre ne peut pas être prêté 2 fois à la même personne. )
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
                                            //modification de nombre du livre disponible
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
                                            fraisRetard = -fraisRetard; //Toutes les charges du clients sont au negative                                            
                                            Transactions.create({
                                                DateTransaction: new Date(Date.now()),
                                                MethodePaiement: null,
                                                Cout: fraisRetard,
                                                Utilisateur_id: req.body.clientEmprunt,
                                                EmployeeId: req.session.loginedUser._id,
                                                Titre: "Retard",
                                                Commentaire: "Retard du livre: " + livre.Titre + ", " + livre.Auteur + ", " + livre.ISBN
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
                                                Titre: "Perte",
                                                Commentaire: "Pert du livre: " + livre.Titre + ", " + livre.Auteur + ", " + livre.ISBN
                                            }, function (err) { if (err) throw err })
                                        }

                                        //modification du nombre de pret d'utilisateur
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
                                            return res.send(JSON.stringify({ 'message': 'Retour réussi' }));
                                        }
                                        if (req.body.choix == "radioPerdu") {
                                            return res.send(JSON.stringify({ 'message': 'Livre perdu traité' }));
                                        }
                                    })
                                }

                            })//fin du loop
                            if (compte == 0) {
                                return res.send(JSON.stringify({ 'message': 'Pas de enrigistement' }));
                            }

                        }//fin de radioRetour et radioPerdu

                    })// fin de la collection d'emprunt


                }//fin du livre s'il existe


            });

        } else {
            return res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        return res.redirect("/login")
    }
})

// Cette page permet d'afficher le livres en retard de plus que deux semaines
app.get('/gestion/retard', async (req, res) => {
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {
            Utilisateurs.find({}, function (err, utilisateurs) {
                if (err) throw err;
                Livres.find({}, function (err, livres) {
                    if (err) throw err;
                    Emprunts.find({}).sort({ DateRetourPrevu: 'asc' }).exec(function (err, emprunts) {
                        if (err) throw err;
                        res.render('GestionRetard', { loginedUser: req.session.loginedUser, utilisateurs: utilisateurs, livres: livres, emprunts: emprunts, now: new Date(Date.now()) });
                    })
                })
            })
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
})

// Cette page permet de traiter les livres en retard de plus que deux semaines comme des livres perdus
app.post('/gestion/perdu', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {
            //calcule frais du retard
            var fraisRetard = req.body.frais_Retard
            if (fraisRetard > 10) { fraisRetard = 10 }
            Transactions.create({
                DateTransaction: new Date(Date.now()),
                MethodePaiement: null,
                Cout: -fraisRetard,
                Utilisateur_id: req.body.client_id,
                EmployeeId: req.session.loginedUser._id,
                Titre: "Retard",
                Commentaire: "Retard du livre: " + req.body.livre_Titre + ", " + req.body.livre_Auteur + ", " + req.body.livre_ISBN
            }, function (err) { if (err) throw err })
            //charge le prix du livre perdu
            Transactions.create({
                DateTransaction: new Date(Date.now()),
                MethodePaiement: null,
                Cout: (-req.body.livre_Cout),
                Utilisateur_id: req.body.client_id,
                EmployeeId: req.session.loginedUser._id,
                Titre: "Perte",
                Commentaire: "Pert du livre: " + req.body.livre_Titre + ", " + req.body.livre_Auteur + ", " + req.body.livre_ISBN
            }, function (err) { if (err) throw err })
            //met a jour l'utilisateur 
            Utilisateurs.findByIdAndUpdate(req.body.client_id, {
                Solde: (req.body.client_Solde - req.body.livre_Cout - fraisRetard),
                NbPret: (req.body.client_NbPret - 1)
            }, function (err) {
                if (err) throw err;
            })
            //Marque le livre comme etant perdu dans la collection des emprunts
            Emprunts.findByIdAndUpdate(req.body.emprunt_id, {
                DateRetour: new Date(Date.now()),
                EstPerdu: true
            }, function (err) {
                if (err) throw err;
            })

            res.send(JSON.stringify({ 'message': 'Livre perdu traité' }));
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
})


// ajax axios
// recherche le client par son numero de telephone et le retourne
app.post('/gestion/findCustomer', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {
            Utilisateurs.findOne({ Telephone: req.body.tel }, function (err, client) {
                if (err) throw err;
                if (client) {
                    Emprunts.find({ Utilisateur_id: client._id }).sort({ DatePret: 'desc' }).exec(function (err, historique) {
                        if (err) throw err;
                        Livres.find({}, function (err, livres) {
                            if (err) throw err;
                            Transactions.find({ Utilisateur_id: client._id }, function (err, transactions) {
                                if (err) throw err;
                                let data = { client, historique, livres, transactions }
                                res.send(JSON.stringify(data))
                            })
                        })
                    })
                } else {
                    res.send(JSON.stringify({ 'message': 'Client not exist' }));
                }

            })
        } else {
            res.status(403).end("Forbidden")
        }
    } else {
        res.redirect("/login")
    }

})

// Cette page permet de facturer, rembourser et recharger le compte des clients
app.get('/gestion/caisse', (req, res) => {
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {//only for admin or staff
            res.render('GestionCaisse', { loginedUser: req.session.loginedUser })
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
})

// Cette page permet d'effectuer les fonctionnalités suivants: facturer, rembourser et recharger le compte des clients
app.post('/gestion/caisse', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');//option,all
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {//only for admin or staff   
            Transactions.create({
                DateTransaction: new Date(Date.now()),
                MethodePaiement: req.body.MethodePaiement,
                Cout: req.body.Cout,
                Utilisateur_id: req.body.Utilisateur_id,
                EmployeeId: req.session.loginedUser._id,
                Titre: req.body.Titre,
                Commentaire: req.body.Commentaire
            }, function (err) { if (err) throw err })
            //modifier le solde du compte
            console.log(req.body.Option)
            if (req.body.Option == 'Recharger' || req.body.Option == 'Facturer' || req.body.MethodePaiement == 'Remboursement au Compte') {
                Utilisateurs.findOne({ _id: req.body.Utilisateur_id }, function (err, client) {
                    if (err) throw err
                    var newSolde = client.Solde + req.body.Cout;
                    client.updateOne({
                        Solde: newSolde.toFixed(2)
                    }, function (err) { if (err) throw err })
                })
            }
            res.send(JSON.stringify({ 'message': 'Transaction réussie' }))
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
})


// afficher la page et effectue une reservation pour un utilisateur
app.get('/gestion/reservation', async (req, res) => {
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {//only for admin or staff
            res.render('GestionReservations', { loginedUser: req.session.loginedUser });
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
})

app.all('/gestion/listReservation', async (req, res) => {
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {//only for admin or staff
            Utilisateurs.find({}, function (err, utilisateurs) {
                if (err) throw err
                Livres.find({}, function (err, livres) {
                    if (err) throw err
                    if (req.body.tel) {
                        Utilisateurs.findOne({ Telephone: req.body.tel }, function (err, client) {
                            if (err) throw err
                            if (client) {
                                Reservations.find({ Utilisateur_id: client._id }, function (err, reservations) {
                                    if (err) throw err
                                    res.render('GestionListReservations', { loginedUser: req.session.loginedUser, utilisateurs: utilisateurs, livres: livres, reservations: reservations });
                                })
                            } else {
                                res.render('GestionListReservations', { loginedUser: req.session.loginedUser, utilisateurs: utilisateurs, livres: livres, reservations: null });
                            }
                        })
                    } else {
                        Utilisateurs.find({}, function (err, utilisateurs) {
                            if (err) throw err
                            Reservations.find({}, function (err, reservations) {
                                if (err) throw err
                                return res.render('GestionListReservations', { loginedUser: req.session.loginedUser, utilisateurs: utilisateurs, livres: livres, reservations: reservations });
                            })
                        })
                    }
                })
            })
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
})

// affiche les reservations d'un utilisateur par son telephone
app.get('/gestion/reservation/:telClient', (req, res) => {
    if (!req.session.loginedUser) return res.redirect("/login")
    else {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {//only for admin or staff
            Utilisateurs.findOne({ Telephone: req.params.telClient }, function (err, client) {
                if (err) throw err;
                Reservations.find({ Utilisateur_id: client._id }).sort({ DateReservation: 'desc' }).exec(function (err, lesRes) {
                    if (err) throw (err)
                    Livres.find({}, function (err, donneesLivre) {
                        if (err) console.log(err)
                        res.render("Reservations", { resInfo: lesRes, livres: donneesLivre, loginedUser: req.session.loginedUser })
                    });
                });
            })
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    }
});

// Cette methode d'afficher la page qui permet de faire la gestion des livres (ajout, suppression, modification)
app.get('/gestion/livres', (req, res) => {
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {//only for admin or staff
            res.render('GestionLivre', { loginedUser: req.session.loginedUser })
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
});

// Cette methode permet de rechercher un livre par son isbn et l'afficher
app.post('/gestion/rechercheLivre', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.session.loginedUser == null) {
        return res.send(JSON.stringify({ 'message': "Il faut se connecter pour utiliser cette fonction", 'code': 10 }));
    }
    if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {
        Livres.findOne({ ISBN: req.body.isbn }, function (err, livre) {
            if (err) throw err;
            if (livre) {
                res.send(JSON.stringify(livre))
            } else {
                res.send(JSON.stringify({ 'message': "Livre non trouvé. Voulez vous l'ajouté dans la bibliotique ?" }));
            }
        })
    } else {
        res.status(403).end("Forbidden")
    }

})

// Cette methode permet de faire l'ajout d'un livre
app.post('/gestion/ajoutLivre', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.session.loginedUser == null) {
        return res.send(JSON.stringify({ 'message': "Il faut se connecter pour utiliser cette fonction", 'code': 10 }));
    }
    if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {
        Livres.findOne({ ISBN: req.body.ISBN }, function (err, livre) {
            if (err) throw err;
            if (livre) {
                return res.send(JSON.stringify({ 'message': "ISBN existe déjà dans la base de données" }));
            } else {

                Livres.create({
                    Auteur: req.body.Auteur,
                    Titre: req.body.Titre,
                    DateParution: req.body.DateParution,
                    NbCopies: req.body.NbCopies,
                    NbDisponible: req.body.NbDisponible,
                    MaisonEdition: req.body.MaisonEdition,
                    ISBN: req.body.ISBN,
                    Cout: req.body.Cout,
                    Description: req.body.Description,
                    Photo: req.body.Photo
                }, function (err, book) {
                    if (err) throw (err);
                    res.send(JSON.stringify({ 'message': "Le livre a été ajouté avec succès" }));
                });
            }
        })
    } else {
        return res.send(JSON.stringify({ 'message': "Vous n'avez pas le droit pour utiliser cette fonction", 'code': 10 }));
    }
});

// Cette methode permet de mettre a jour les informations d'un livre
app.post('/gestion/updateLivre', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.session.loginedUser == null) {
        return res.send(JSON.stringify({ 'message': "Il faut se connecter pour utiliser cette fonction", 'code': 10 }));
    }
    if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {
        Livres.findOneAndUpdate({ ISBN: req.body.ISBN }, {
            Auteur: req.body.Auteur,
            Titre: req.body.Titre,
            DateParution: req.body.DateParution,
            NbCopies: req.body.NbCopies,
            NbDisponible: req.body.NbDisponible,
            MaisonEdition: req.body.MaisonEdition,
            Cout: req.body.Cout,
            Description: req.body.Description,
            Photo: req.body.Photo
        }, function (err, book) {
            if (err) throw (err);
            res.send(JSON.stringify({ 'message': "Le livre a été mise à jour avec succès" }));
        });
    } else {
        return res.send(JSON.stringify({ 'message': "Vous n'avez pas le droit pour utiliser cette fonction", 'code': 10 }));
    }
});

// Ajax
// Cette methode permet televerser une image et de retourner son chemin
app.post('/gestion/livre/photo', urlencodeParser, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.session.loginedUser == null) {
        return res.send(JSON.stringify({ 'message': "Il faut se connecter pour utiliser cette fonction", 'code': 10 }));
    }
    if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {
        var uploadPhotoPath = "./public/Images/Livres/";
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) throw err
            if (files.image) {
                var oldPath = files.image.filepath;
                var newName = fields.isbn + path.extname(files.image.originalFilename);
                var newPath = uploadPhotoPath + newName;
                fs.rename(oldPath, newPath, function (err) {
                    if (err) throw err;
                    res.send(JSON.stringify({ "path": "/Images/Livres/" + newName, 'message': "Image Updated" }))
                });
            } else {
                res.send(JSON.stringify({ "path": "/Images/ImgNotFound.png" }))
            }
        });
    } else {
        return res.send(JSON.stringify({ 'message': "Vous n'avez pas le droit pour utiliser cette fonction", 'code': 10 }));
    }
});


// Cette methode permet de suprrimer un livre
app.post('/gestion/livre/delete', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.session.loginedUser == null) {
        return res.send(JSON.stringify({ 'message': "Il faut se connecter pour utiliser cette fonction", 'code': 10 }));
    }
    if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {
        Livres.findOneAndDelete({ ISBN: req.body.ISBN }, function (err, book) {
            if (err) throw (err);
            res.send(JSON.stringify({ 'message': "Le livre a été supprimé" }));
        });
    } else {
        return res.send(JSON.stringify({ 'message': "Vous n'avez pas le droit pour utiliser cette fonction", 'code': 10 }));
    }
});

// Cette methode fait la recherche et l'affichage de toutes les transactions de tous les utilisateurs
app.all('/gestion/transaction', (req, res) => {
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99 || req.session.loginedUser.Droit_id == 1) {//only for admin or staff
            var start, end
            if (req.body.start) {
                start = new Date(req.body.start).getTime()
            } else {
                start = new Date(0).getTime()
            }
            if (req.body.end) {
                end = new Date(req.body.end).getTime()
            } else {
                end = new Date(Date.now()).getTime()
            }
            if (req.body.tel) {
                Utilisateurs.find({}, function (err, utilisateurs) {
                    if (err) throw err;
                    Utilisateurs.findOne({ Telephone: req.body.tel }, function (err, client) {
                        if (err) throw err;
                        if (client) {
                            Transactions.find({ Utilisateur_id: client._id }).sort({ DateTransaction: 'desc' }).exec(function (err, transactions) {
                                if (err) throw err;
                                res.render('GestionTransaction', { loginedUser: req.session.loginedUser, utilisateurs: utilisateurs, transactions: transactions, start: start, end: end })
                            })
                        } else {
                            res.render('GestionTransaction', { loginedUser: req.session.loginedUser, utilisateurs: utilisateurs, transactions: null, start: start, end: end })
                        }
                    })
                });
            } else {
                Utilisateurs.find({}, function (err, utilisateurs) {
                    if (err) throw err;
                    Transactions.find({}).sort({ DateTransaction: 'desc' }).exec(function (err, transactions) {
                        if (err) throw err;
                        res.render('GestionTransaction', { loginedUser: req.session.loginedUser, utilisateurs: utilisateurs, transactions: transactions, start: start, end: end })
                    })
                });
            }
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
});


// *** TOUT LES FONCTIONNALITÉS DANS LA PARTIE QUI SUIT  ***
// *** PEUT SEULEMENT ETRE EFFECTUÉ PAR UN ADMIN ***********


// affiche la liste de tous les utilisateurs
app.get('/gestion/listUtilisateur', async (req, res) => {
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99) {//only for admin 
            Utilisateurs.find({}, function (err, utilisateurs) {
                if (err) throw err;
                Droits.find({}, function (err, droits) {
                    if (err) throw err;
                    res.render('GestionListUtilisateur', { loginedUser: req.session.loginedUser, utilisateurs: utilisateurs, droits: droits });
                })
            })
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
})

// cette methode permet de supprimer un utilisateur
app.post('/gestion/supprimerUtilisateur', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99) {//only for admin
            Utilisateurs.findByIdAndRemove(req.body.ID, function (err) {
                if (err) throw err;
                res.send(JSON.stringify({ 'message': 'Utilisateur supprimé' }))
            })
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
})

// affiche les information d'un utilisateur avant les modifications
app.get('/gestion/utilisateur/:id', (req, res) => {
    if (req.session.loginedUser) {
        if (req.session.loginedUser.Droit_id == 99) {//only for admin
            Utilisateurs.findById(req.params.id, function (err, utilisateur) {
                if (err) throw err;
                Droits.find({}, function (err, droits) {
                    if (err) throw err;
                    res.render('GestionUtilisateur', { loginedUser: req.session.loginedUser, utilisateur: utilisateur, droits: droits });
                })

            })
        } else {
            res.status(403).end("vous n'avez pas le droit")
        }
    } else {
        res.redirect("/login")
    }
})

// modifie les information d'un utilisateur
app.post('/gestion/utilisateurUpdate', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.session.loginedUser == null) {
        return res.send(JSON.stringify({ 'message': "Il faut se connecter pour utiliser cette fonction", 'code': 10 }));
    }
    if (req.session.loginedUser.Droit_id == 99) {//only for admin

        Utilisateurs.findOne({ Telephone: req.body.telephone }, function (err, result) {
            if (err) throw err;
            if (result._id != req.body.id) {
                return res.send(JSON.stringify({ 'message': 'Le téléphone existe dans la base de données' }));
            } else {
                Utilisateurs.findOne({ Email: req.body.email }, function (err, result) {
                    if (err) throw err;
                    if (result._id != req.body.id) {
                        return res.send(JSON.stringify({ 'message': 'Email existe dans la base de données' }));
                    } else {
                        Utilisateurs.findById(req.body.id, function (err, utilisateur) {
                            if (err) throw err;
                            if (utilisateur.Solde != req.body.solde) {
                                Transactions.create({
                                    DateTransaction: new Date(Date.now()),
                                    Cout: (req.body.solde - utilisateur.Solde).toFixed(2),
                                    Utilisateur_id: req.body.id,
                                    EmployeeId: req.session.loginedUser._id,
                                    Titre: "Ajustement",
                                    Commentaire: "Solde du compte précedent: " + utilisateur.Solde + "\rNouveau solde du compte: " + req.body.solde
                                }, function (err) { if (err) throw err })
                            }
                        })
                        Utilisateurs.findByIdAndUpdate(req.body.id, {
                            Nom: req.body.nom,
                            Prenom: req.body.prenom,
                            Telephone: req.body.telephone,
                            Email: req.body.email,
                            MaxPret: req.body.MaxPret,
                            NbPret: req.body.NbPret,
                            Solde: req.body.solde,
                            Droit_id: req.body.droit
                        }, function (err) {
                            if (err) throw err;
                            res.send(JSON.stringify({ 'message': 'Utilisateur update' }));
                        })

                    }
                })
            }
        })
    } else {
        res.status(403).end("vous n'avez pas le droit")
    }

})

// cette méthode permet de reinitialiser le mot de passe par un qui est temporaire
app.post('/gestion/resetPassword', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.session.loginedUser == null) {
        return res.send(JSON.stringify({ 'message': "Il faut se connecter pour utiliser cette fonction", 'code': 10 }));
    }
    if (req.session.loginedUser.Droit_id == 99) {//only for admin
        var passwordtemp = Math.floor(1000 + Math.random() * 9000).toString().trim();
        Utilisateurs.findByIdAndUpdate(req.body.id, {
            Password: passwordtemp
        }, function (err) {
            if (err) throw err;
            return res.send(JSON.stringify({ 'message': "Le nouveau mot de passe est: " + passwordtemp }));
        })

    } else {
        res.status(403).end("vous n'avez pas le droit")
    }
})


// ********************* TEMPORAIRE *********************
// app.get('/test', (req, res) => {
//     res.render('test');
// })

// app.get('/profil/facture', async (req, res) => {
//     if (req.session.loginedUser) {
//         res.render('PaiementFacture', { loginedUser: req.session.loginedUser });
//     } else {
//         res.redirect('/login');
//     }
// });