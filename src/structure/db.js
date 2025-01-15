import PouchDB from 'pouchdb-browser';

const localDB = new PouchDB('local-infradon');
const remoteDB = new PouchDB('http://<remote-ip>:5984/infra-don'); // Remplacez <remote-ip>

localDB.sync(remoteDB, {
  live: true,
  retry: true,
});

export { localDB, remoteDB };

//J'ai rien capté à la replication mais ça marche pas de 
//base ma bdd à laquelle je me connecte pour tout le projet est déjà en local