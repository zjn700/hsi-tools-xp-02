var express = require('express');
var router = express.Router();
var path = require('path');

var Datastore = require('nedb'),
    dbNotLoaded = false,
    dbErr = null,
    dbn = new Datastore({ filename: path.join(__dirname, '..', '/data-admin/hsi-domains-test'), autoload: true, onload : function(err) {
            if (err) {
                console.log(err);
                dbNotLoaded = true;
                dbErr = err;
            }
        } 
    });
    
/* GET questionnaires listing. */

router.get('/xxx', function(req, res, next) {
  res.send('here in domains get');
});

router.get('/dummy', function(req, res, next) {
    return res.status(200).json({
            title: "Use existing domains",
        }); 
});

router.get('/', function (req, res, next) {
    console.log(dbNotLoaded)
    if (dbNotLoaded) {
        console.log('DB Error')
        return res.status(500).json({
            title: "A database error occured",
            error: dbErr
        }); 
    }
    
    dbn.find({}).sort({ qnn: 1, sequence: 1}).exec(function (err, domains) {
    //dbn.find({} ,function (err, domains) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured",
                error: err
            });                
        }
        if (domains.length==0) {
            return res.status(500).json({
                title: "No domains found",
                obj: domains
            });           
        }
        res.status(201).json({
            message: "Success",
            obj: domains
        });
    });        
    
});

router.get('/:id', function (req, res, next) {
    console.log(dbNotLoaded)
    if (dbNotLoaded) {
        console.log('DB Error')
        return res.status(500).json({
            title: "A database error occured",
            error: dbErr
        }); 
    }
    console.log(req.params.id)
    dbn.find({qnn: req.params.id}).sort({ sequence: 1 }).exec(function (err, domains) {
    //dbn.find({category: req.params.id} ,function (err, domains) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured",
                error: err
            });                
        }
        if (domains.length==0) {
            return res.status(500).json({
                title: "No questionnaires found",
                obj: domains
            });           
        }
        console.log(domains.length)
        res.status(201).json({
            message: "Success",
            obj: domains
        });
    });        
    
});


router.use('/', function (req, res, next) {
    console.log('in router use')
    jwt.verify(req.query.token, 'zz-hsi-tool', function(err, decoded){
        if (err) {
            console.log('err ' + err)
            return res.status('401').json({
                message: 'Not Authenticated',
                error: err
            })
        }
        next();
    })
    
});

router.post('/', function (req, res, next) {
    console.log('here in post')
})

router.post('/:id', function (req, res, next) {
    console.log('in post')
    console.log('req.body')
    console.log(req.body)
    console.log(jwt.decode(req.query.token))
    if (dbNotLoaded) {
        console.log('DB Error -- cannot post')
        return res.status(200).json({
            title: "A database error occured -- your post was not made",
            error: dbErr
        }); 
    }
    console.log('past deNotLoaded')
    

    var titleTest = req.body.title;
    console.log('titleTest')
    console.log(titleTest)
    if ( (titleTest === null) || (titleTest.replace(/\s/g,'') == "")) { 
        return res.status(200).json({
                title: "You must enter a title for the domain .",
            });   
    }
    
    var decoded = jwt.decode(req.query.token)
    console.log(decoded.user._id)

    var domain = {
        qnn: req.body.qnn,
        title: req.body.title,
        sequence: req.body.sequence
    }
    console.log('domain')
    console.log(domain)

    dbn.insert(domain, function (err, domain) {  
        if (err) {
            console.log(err)
            return res.status(405).json({
                title: "An error occured and the domain was not created",
                error: err
            });                
        }
        res.status(201).json({
            message: "Domain was created",
            obj: domain
        });                

    });  
});


router.patch('/:id', function (req, res, next) {
  if (dbNotLoaded) {
      console.log('DB Error -- cannot patch')
      return res.status(500).json({
          title: "A database error occured -- your post was not made",
          error: dbErr
      }); 
  }
     
  dbn.update({ _id: req.body.id }, { $set: { 
          title: req.body.title, 
          description: req.body.description,
          state: req.body.state,
          states: req.body.states
        }}, {}, function (err, numReplaced) {

  //dbn.update({ _id: req.body.id }, project, {}, function (err, numReplaced) {
      console.log('numReplaced')
      console.log(numReplaced)
      if (err) {
          console.log(err)
          return res.status(500).json({
              title: "An error occured while updating",
              error: err
          });    
      }    
      res.status(201).json({
          message: "Project was updated",
          obj: numReplaced
      });              
  });
  
});


router.delete('/:id', function (req, res, next) {
})
module.exports = router;


