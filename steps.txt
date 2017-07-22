1 ==== bash terminal commands:

----angular requires a newer version of node > 6.9.0
---type the following to find out which version you have:
node -v

---if you need to update, do these steps:
nvm install node
node -v
nvm list
nvm alias default <number>  (newest right now is 7, but use the first number of the version you just installed)
nvm use <number>   (apparently, just installing a newer version doesn't mean it's the one you're using)

----start here to start installing your new 
mkdir
npm install express-generator 
express <app name>  (i used xg-ng)
cd <app name>
npm install
npm start

npm install -g @angular/cli
npm install --save-dev @angular/cli
ng new <project name>   (i used xg-ng)
cd <project name>
ng build 

cd ..  (should be in the root folder of the express app (mine was xg-ng)
npm install nedb --save  

2 ==== editing installed files:

----add to express app.js (replace existing static declaration):
app.use(express.static(path.join(__dirname, 'ng-xg/dist')));

---add to any router file that will use nedb:
var Datastore = require('nedb'),
    dbn = new Datastore({ filename: path.join(__dirname, '..', '/data/hsi-qnn'), autoload: true });

3 ==== needed for encrypting password and creating the auth token

npm install --save bcrypt
npm install -- save jsonwebtoken


3 ==== other steps:

git add .
git commit -m <msg>
git push origin master

look in the package.json file of the express app and the ng project to see installed dependencies and versions

how-to unzip a tar file:
tar -xvzf <file.name>    (xray victor zulu fox)

https://github.com/angular/angular-cli/issues/2818

http://stackoverflow.com/questions/21237105/const-in-javascript-when-to-use-it-and-is-it-necessary
http://stackoverflow.com/questions/23483926/const-vs-var-while-requiring-a-module

http://stackoverflow.com/questions/37247246/html5-event-handlingonfocus-and-onfocusout-using-angular-2
--Try to use (focus) and (focusout) instead of onfocus and onfocusout



        // console.log(Object.keys(this.domain))
        // console.log(JSON.stringify(this.domain))
        // console.log(this.domains)
        // let p = this.domain;
        // for (var key in p) {
        //   if (p.hasOwnProperty(key)) {
        //     console.log(key + " -> " + p[key]);
        //   }
        // }
        
        
        <span
            class='glyphicon glyphicon-ok'
            *ngIf="answers[question.sequence - 1]?.id"
            [ngClass]="{'neg': answers[question.sequence - 1].value==false, 
                        'pos':answers[question.sequence - 1].value==true}"> 
        </span>