// import PouchDB from 'pouchdb';

// // Base locale
// const localDB = new PouchDB('local-infrdon');


// // Fonction pour synchroniser les bases de données
// function setupReplication() {
//   localDB.sync(remoteDB, {
//       live: true,
//       retry: true,
//   })
//   .on('change', (info) => {
//       console.log('Changements détectés lors de la réplication :', info);
//   })
//   .on('paused', (err) => {
//       console.log('Réplication en pause.', err);
//   })
//   .on('active', () => {
//       console.log('Réplication reprise.');
//   })
//   .on('denied', (err) => {
//       console.error('Réplication refusée :', err);
//   })
//   .on('complete', (info) => {
//       console.log('Réplication terminée :', info);
//   })
//   .on('error', (err) => {
//       console.error('Erreur lors de la réplication :', err);
//   });
// }

// export { localDB, setupReplication };


// //J'ai rien capté à la replication mais ça marche pas de 
// //base ma bdd à laquelle je me connecte pour tout le projet est déjà en local