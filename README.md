# nabaztag-pi-node

installation nodejs en ssh 

> sudo apt-get update  
> sudo apt-get install nodejs npm

(facultatif) recuperer un identifiant matériel sur homedoudou.fr  
copier l'identifiant dans un fichier homedoudouId.txt à mettre à la racine du dossier

installer les dependances

> npm install

lancer temporairement le server node avec la commande

> node index.js  

lancer le server node comme service

> sudo npm install pm2 -g  
> pm2 start index.js  
> sudo pm2 startup systemd -u pi  
> sudo env PATH=$PATH:/usr/local/bin pm2 startup systemd -u pi --hp /home/pi  
> pm2 save
