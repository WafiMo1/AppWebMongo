db.Livres.drop()
db.Utilisateurs.drop()
db.Droits.drop()
db.Emprunts.drop()
db.Reservations.drop()

db.Livres.insertMany([
{"Auteur":"Albert Camus","Titre":"La peste","DateParution":"2007","NbCopies":"5","NbDisponible":"5","MaisonEdition":"folio","ISBN":"ACLP002","Cout":"11.99","Description":" L'intrigue du roman présente l'histoire d'une épidémie de peste qui sévit sur la ville d'Oran dans les années 1940. Des rats viennent mourir au grand jour ; ils portent le bacille de la peste.","Photo":"\/Images\/Livres\/AlbertCamus\/laPeste.jpg"},
{"Auteur":"Albert Camus","Titre":"La chute","DateParution":"1998","NbCopies":"4","NbDisponible":"4","MaisonEdition":"folio","ISBN":"ACLC003","Cout":"8.99","Description":" Sur le pont, je passai derrière une forme penchée sur le parapet, et qui semblait regarder le fleuve. De plus près, je distinguai une mince jeune femme, habillée de noir.","Photo":"\/Images\/Livres\/AlbertCamus\/laChute.jpg"},
{"Auteur":"Albert Camus","Titre":"Les justes","DateParution":"2002","NbCopies":"4","NbDisponible":"4","MaisonEdition":"folio","ISBN":"ACLJ004","Cout":"9.99","Description":" Ne pleurez pas. Non, non, ne pleurez pas ! Vous voyez bien que c'est le jour de la justification. Quelque chose s'élève à cette heure qui est notre témoignage à nous autres révoltés : Yanek n'est plus un meurtrier.","Photo":"\/Images\/Livres\/AlbertCamus\/lesJustes.jpg"},
{"Auteur":"Albert Camus","Titre":"L'étranger","DateParution":"2001","NbCopies":"3","NbDisponible":"3","MaisonEdition":"folio","ISBN":"ACLE005","Cout":"12.99","Description":" Récit intérieur de Meursault, employé de bureau anonyme pour les autres et pour lui-même, qui tue finalement de cinq balles un Algérien sur la plage de Tipaza à Alger.","Photo":"\/Images\/Livres\/AlbertCamus\/lEtanger.jpg"},
{"Auteur":"Eric-Emmanuel Schmitt","Titre":"Le chien","DateParution":"2001","NbCopies":"5","NbDisponible":"4","MaisonEdition":"Albin Michel","ISBN":"ESLC001","Cout":"5.99","Description":" Samuel Heymann, un médecin du Hainaut, se suicide quelques jours après la mort de son chien.","Photo":"\/Images\/Livres\/EricEmannuelShmitt\/leChien.jpg"},
{"Auteur":"Eric-Emmanuel Schmitt","Titre":"Les deux messieurs de Bruxelles","DateParution":"2015","NbCopies":"4","NbDisponible":"4","MaisonEdition":"Livre de Poche","ISBN":"ACLE001","Cout":"12.99","Description":" Cinq nouvelles sur le mystère des sentiments inavoués.","Photo":"\/Images\/Livres\/EricEmannuelShmitt\/deuxMessieursdeBruxelles.jpg"},
{"Auteur":"Eric-Emmanuel Schmitt","Titre":"Monsieur Ibrahim et les fleurs du coran","DateParution":"2016","NbCopies":"4","NbDisponible":"3","MaisonEdition":"Livre de Poche","ISBN":"ESMF003","Cout":"15.99","Description":" Paris dans les années 60. Moïse, dit Momo, est un garçon de 12 ans qui s'ennuie. Quand son père, un avocat juif neurasthénique, se suicide, il est adopté par Monsieur Ibrahim, épicier arabe, musulman, plus exactement soufi.","Photo":"\/Images\/Livres\/EricEmannuelShmitt\/fleursDuCoran.jpg"},
{"Auteur":"Eric-Emmanuel Schmitt","Titre":"Oscar et la dame rose","DateParution":"2008","NbCopies":"3","NbDisponible":"3","MaisonEdition":"Livre de Poche","ISBN":"ESOD004","Cout":"17.99","Description":" Sur le conseil de Mamie Rose, une visiteuse, le jeune Oscar, âgé de 10 ans et condamné par un cancer, écrit à Dieu depuis son lit d'hôpital afin de lui confier le récit de sa vie.","Photo":"\/Images\/Livres\/EricEmannuelShmitt\/oscarDameRose.jpg"},
{"Auteur":"Franz Kafka","Titre":"La métamorphose","DateParution":"1985","NbCopies":"5","NbDisponible":"4","MaisonEdition":"folio classique","ISBN":"FKLM001","Cout":"7.99","Description":" Un homme, transformé en coléoptère monstrueux, se trouve confronté à sa famille dont l'ambition est de l'éliminer.","Photo":"\/Images\/Livres\/FranzKafka\/laMetamorphose.jpg"},
{"Auteur":"Franz Kafka","Titre":"Les dessins","DateParution":"1986","NbCopies":"4","NbDisponible":"3","MaisonEdition":"Les Cahiers Dessines","ISBN":"FKLD002","Cout":"13.99","Description":" Entre 1901 et 1907, Kafka dessine intensément, saisissant sur le vif des êtres fragiles et instables.","Photo":"\/Images\/Livres\/FranzKafka\/lesDessins.jpg"},
{"Auteur":"Franz Kafka","Titre":"Le procès","DateParution":"1988","NbCopies":"4","NbDisponible":"2","MaisonEdition":"folio classique","ISBN":" FKLP003","Cout":"16.99","Description":" On raconte que c'est grâce aux éditions clandestines du samizdat - et donc, sans nom d'auteur - que fut introduite en Union soviétique la traduction du Procès. ","Photo":"\/Images\/Livres\/FranzKafka\/leProces.jpg"},
{"Auteur":"Franz Kafka","Titre":"Le château","DateParution":"1982","NbCopies":"3","NbDisponible":"2","MaisonEdition":"points","ISBN":" FKLC004","Cout":"18.99","Description":" Le récit suit les aventures de K., qui se bat pour entrer en contact avec les autorités du village où il vient d'arriver, afin d'officialiser son statut d'arpenteur.","Photo":"\/Images\/Livres\/FranzKafka\/leChateau.jpg"},
{"Auteur":"Herman Hesse","Titre":"Demian","DateParution":"1989","NbCopies":"5","NbDisponible":"4","MaisonEdition":"Livre de Poche","ISBN":"HHDE001","Cout":"15.99","Description":" Demian est le roman d'une adolescence, roman d'initiation, de formation, et l'un des chefs-d'oeuvre du genre","Photo":"\/Images\/Livres\/HermanHesse\/Demian.jpg"},
{"Auteur":"Herman Hesse","Titre":"L'ornière","DateParution":"1995","NbCopies":"4","NbDisponible":"3","MaisonEdition":"Livre de Poche","ISBN":"HHDE002","Cout":"5.99","Description":"L'histoire d'un adolescent aux dons et à l'intelligence exceptionnels mais que le protestantisme et des méthodes d'enseignement impitoyables et orgueilleuses vont broyer sans remords.","Photo":"\/Images\/Livres\/HermanHesse\/Lorniere.jpeg"},
{"Auteur":"Herman Hesse","Titre":"Le loup des steppes","DateParution":"1997","NbCopies":"4","NbDisponible":"3","MaisonEdition":"Livre de Poche","ISBN":"HHLS003","Cout":"17.99","Description":"Expérience spirituelle, récit initiatique, délire de psychopathe, Le Loup des steppes multiplie les registres.","Photo":"\/Images\/Livres\/HermanHesse\/loupSteppes.jpg"},
{"Auteur":"Herman Hesse","Titre":"Berthold","DateParution":"2000","NbCopies":"3","NbDisponible":"3","MaisonEdition":"Livre de Poche","ISBN":"HHBE004","Cout":"13.99","Description":" Six nouvelles écrites entre 1908 et 1922 qui décrivent l'itinéraire de cinq hommes - un séminariste. ","Photo":"\/Images\/Livres\/HermanHesse\/berthold.jpg"},
{"Auteur":"Paolo Coelho","Titre":"L'Alchimiste","DateParution":"2018","NbCopies":"5","NbDisponible":"5","MaisonEdition":"J'ai lu","ISBN":"PCAL001","Cout":"19.99","Description":"Le récit de la quête de Santiago et qui appprend à lire les signes du destin et à aller au bout de son rêve.","Photo":"\/Images\/Livres\/PaoloCoelho\/lalchimiste.jpg"},
{"Auteur":"Paolo Coelho","Titre":"Brida","DateParution":"2015","NbCopies":"4","NbDisponible":"4","MaisonEdition":"A Novel","ISBN":"PCBR002","Cout":"17.99","Description":"Brida est une jeune Irlandaise aux pouvoirs surnaturels qui se lance dans une quête effrénée de sagesse et de magie.","Photo":"\/Images\/Livres\/PaoloCoelho\/brida.jpg"},
{"Auteur":"Paolo Coelho","Titre":"La voie de l'archer","DateParution":"2016","NbCopies":"4","NbDisponible":"4","MaisonEdition":"Flammarion","ISBN":"PCLV003","Cout":"21.99","Description":"Un jeune archer à l'agilité prodigieuse se rend auprès du maître Tetsuya pour le défier. Ce dernier confie à un jeune garçon les principes fondamentaux de la voie de l'archer.","Photo":"\/Images\/Livres\/PaoloCoelho\/laVoieDeLarcher.jpg"},
{"Auteur":"Paolo Coelho","Titre":"Le Zahir","DateParution":"2016","NbCopies":"3","NbDisponible":"0","MaisonEdition":"Flammarion","ISBN":"PCLZ004","Cout":"25.99","Description":"Un écrivain célèbre raconte la disparition de sa femme, Esther, correspondante de guerre.","Photo":"\/Images\/Livres\/PaoloCoelho\/leZahir.jpg"}
])

db.Utilisateurs.insertMany([
  {
  "Nom": "Michelle",
  "Prenom": "Horton",
  "Telephone": "5142994742",
  "Email": "MichelleHorton@gmail.com",
  "Password": "abc123",
  "Photo": "/Images/Profil/1.png",
  "MaxPret": 5,
  "NbPret": 0,
  "Droit_id": 0
},{
  "Nom": "Maria",
  "Prenom": "Duke",
  "Telephone": "4162438749",
  "Email": "MariaDuke@gmail.com",
  "Password": "abc123",
  "Photo": "/Images/Profil/2.png",
  "MaxPret": 5,
  "NbPret": 0,
  "Droit_id": 0
},{
  "Nom": "David",
  "Prenom": "Day",
  "Telephone": "4169319545",
  "Email": "DavidDay@gmail.com",
  "Password": "abc123",
  "Photo": "/Images/Profil/3.png",
  "MaxPret": 5,
  "NbPret": 0,
  "Droit_id": 0
},{
  "Nom": "Augustine",
  "Prenom": "Chambers",
  "Telephone": "9054803579",
  "Email": "AugustineChambers@gmail.com",
  "Password": "abc123",
  "Photo": "/Images/Profil/4.png",
  "MaxPret": 5,
  "NbPret": 0,
  "Droit_id": 0
},{
  "Nom": "Michael",
  "Prenom": "Alexander",
  "Telephone": "7809999518",
  "Email": "MichaelAlexander@gmail.com",
  "Password": "abc123",
  "Photo": "/Images/Profil/5.png",
  "MaxPret": 5,
  "NbPret": 0,
  "Droit_id": 0
},{
  "Nom": "Charles ",
  "Prenom": "Thomas",
  "Telephone": "6044525679",
  "Email": "CharlesThomas@gmail.com",
  "Password": "abc123",
  "Photo": "/Images/Profil/6.png",
  "MaxPret": 5,
  "NbPret": 0,
  "Droit_id": 0
},{
  "Nom": "Wajd ",
  "Prenom": "Horton",
  "Telephone": "5142994744",
  "Email": "WajdHorton@gmail.com",
  "Password": "abc123",
  "Photo": "/Images/Profil/7.png",
  "MaxPret": 5,
  "NbPret": 0,
  "Droit_id": 0
},{
  "Nom": "Raniya ",
  "Prenom": "Samaha",
  "Telephone": "6049287185",
  "Email": "RaniyaSamaha@gmail.com",
  "Password": "abc123",
  "Photo": "/Images/Profil/8.png",
  "MaxPret": 5,
  "NbPret": 0,
  "Droit_id": 0
},{
  "Nom": "Abdul ",
  "Prenom": "Naifeh",
  "Telephone": "7056982151",
  "Email": "AbdulNaifeh@gmail.com",
  "Password": "abc123",
  "Photo": "/Images/Profil/9.png",
  "MaxPret": 5,
  "NbPret": 0,
  "Droit_id": 0
}])

db.Droits.insertMany([
 {
  "_id": 99,
  "Description": "Admin"
},{
  "_id": 0,
  "Description": "Utilisateur"
},{
  "_id": 1,
  "Description": "Staff"
}])

db.Emprunts.insertMany([
    {
        DatePret:'2022-01-31',
        DateRetourPrevu :'2022-02-14',
        DateRetour: '2022-02-14',
        Livre_id: 1,
        Utilisateur_id : 1
    },
    {
        DatePret:'2022-01-31',
        DateRetourPrevu :'2022-02-14',
        DateRetour: '2022-02-10',
        Livre_id: 1,
        Utilisateur_id : 2
    },
    {
        DatePret:'2022-01-24',
        DateRetourPrevu :'2022-02-07',
        DateRetour:'2022-02-17',
        Livre_id:2,
        Utilisateur_id : 2
    },
    {
        DatePret:'2022-02-15',
        DateRetourPrevu :'2022-03-01',
        DateRetour: null,
        Livre_id: 5,
        Utilisateur_id : 3
    },
    {
        DatePret:'2022-01-24',
        DateRetourPrevu :'2022-02-07',
        DateRetour: null,
        Livre_id: 8,
        Utilisateur_id : 4
    },
    {
        DatePret:'2022-02-15',
        DateRetourPrevu :'2022-03-01',
        DateRetour: null,
        Livre_id: 9,
        Utilisateur_id : 6
    },
    {
        DatePret:'2022-02-15',
        DateRetourPrevu :'2022-03-01',
        DateRetour: null,
        Livre_id: 10,
        Utilisateur_id : 6
    },
    {
        DatePret:'2022-02-15',
        DateRetourPrevu :'2022-03-01',
        DateRetour: null,
        Livre_id: 11,
        Utilisateur_id : 6
    },
    {
        DatePret:'2022-02-15',
        DateRetourPrevu : '2022-03-01',
        DateRetour: null,
        Livre_id: 11,
        Utilisateur_id : 8
    },
    {
        DatePret:'2022-02-15',
        DateRetourPrevu :'2022-03-01',
        DateRetour: null,
        Livre_id: 12,
        Utilisateur_id : 8
    },
    {
        DatePret:'2022-02-15',
        DateRetourPrevu :'2022-03-01',
        DateRetour: null,
        Livre_id: 13,
        Utilisateur_id : 8
    },
    {
        DatePret:'2022-02-15',
        DateRetourPrevu :'2022-03-01',
        DateRetour: null,
        Livre_id: 14,
        Utilisateur_id : 8
    },
    {
        DatePret:'2022-02-15',
        DateRetourPrevu :'2022-03-01',
        DateRetour: null,
        Livre_id: 15,
        Utilisateur_id : 8
    },
    {
        DatePret:'2022-02-15',
        DateRetourPrevu :'2022-03-01',
        DateRetour: null,
        Livre_id: 20,
        Utilisateur_id : 5
    },

{
        DatePret:'2022-02-15',
        DateRetourPrevu :'2022-03-01',
        DateRetour: null,
        Livre_id: 20,
        Utilisateur_id : 7
    },

{
        DatePret:'2022-02-15',
        DateRetourPrevu :'2022-03-01',
        DateRetour: null,
        Livre_id: 20,
        Utilisateur_id : 9
    }
])

db.Reservations.insertMany([
    {
        DateReservation: null,
        Livre_id: null,
        Utilisateur_id: null
    }
])


db.Livres.createIndex( { ISBN: 1 }, { unique: true } )
db.Utilisateurs.createIndex( { Email: 1, Telephone: 1}, { unique: true } )

