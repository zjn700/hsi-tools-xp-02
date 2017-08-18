var express = require('express');
var router = express.Router();
var path = require("path");
var jwt = require("jsonwebtoken");

// create and loaad the project db
var Datastore = require('nedb'),
    dbNotLoaded = false,
    dbErr = null,
    dbn = new Datastore({ filename: path.join(__dirname, '..', '/data/hsi-projects'), autoload: true, onload : function(err) {
            if (err) {
                console.log(err);
                dbNotLoaded = true;
                dbErr = err;
            }
        } 
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
    //dbn.find({}).sort({ title: -1 }).exec(function (err, projects) {
    dbn.find({}).sort({ 'state.dateModified': -1, dateCreated: -1 }).exec(function (err, projects) {
    //dbn.find({}).sort({ dateCreated: -1 }).exec(function (err, projects) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured",
                error: err
            });                
        }
        if (projects.length==0) {
            return res.status(204).json({
                title: "No projects found",
                obj: projects
            });           
        }
        res.status(201).json({
            message: "Success",
            obj: projects
        });
    });        
    
});

router.get('/dummy', function(req, res, next) {
    return res.status(200).json({
            title: "Use existing projects",
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
    dbn.findOne({ _id: req.params.id }, function (err, project) {
    //dbn.find({category: req.params.id} ,function (err, qnns) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured",
                error: err
            });                
        }
        if (project.length==0) {
            return res.status(500).json({
                title: "No project found",
                obj: project
            });           
        }
        res.status(201).json({
            message: "Success",
            obj: project
        });
    });        
    
});



router.use('/', function (req, res, next) {
    jwt.verify(req.query.token, 'zz-hsi-tool', function(err, decoded){
        if (err) {
            return res.status('401').json({
                message: 'Not Authenticated',
                error: err
            })
        }
        next();
    })
    
});


router.post('/', function (req, res, next) {
    if (dbNotLoaded) {
        console.log('DB Error -- cannot post')
        return res.status(500).json({
            title: "A database error occured -- your post was not made",
            error: dbErr
        }); 
    }
    
    var titleTest = req.body.title;
    if ( (titleTest === null) || (titleTest.replace(/\s/g,'') == "")) { 
        return res.status(500).json({
                title: "You must enter a title for the project.",
            });   
    }
    var decoded = jwt.decode(req.query.token)
    console.log(decoded.user._id)

    var project = {
        title: req.body.title,
        description: req.body.description,
        dateCreated: req.body.dateCreated,
        users: req.body.users,
        state: req.body.state,
        states: req.body.states,
        archived: false
    }
    dbn.insert(project, function (err, project) {  
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured and the project was not created",
                error: err
            });                
        }
        res.status(201).json({
            message: "Project was created",
            obj: project
        });                

    });  
});


router.patch('/:id', function (req, res, next) {
  console.log('in patch')
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

router.patch('/archive/:id', function (req, res, next) {
  console.log('req.body')
  console.log(req.body)
  if (dbNotLoaded) {
      console.log('DB Error -- cannot patch')
      return res.status(500).json({
          title: "A database error occured -- your post was not made",
          error: dbErr
      }); 
  }
     
  dbn.update({ _id: req.body.id }, { $set: { 
          archived: req.body.archived,
          state: req.body.state
        }}, {}, function (err, numReplaced) {

  //dbn.update({ _id: req.body.id }, project, {}, function (err, numReplaced) {
      console.log('numReplaced')
      console.log(numReplaced)
      if (err) {
          console.log(err)
          return res.status(500).json({
              title: "An error occured while archiving",
              error: err
          });    
      }    
      res.status(201).json({
          message: "Project was archived",
          obj: numReplaced
      });              
  });
  
});

router.delete('/:id', function (req, res, next) {
    if (dbNotLoaded) {
        console.log('DB Error -- cannot patch')
        return res.status(500).json({
            title: "A database error occured -- your post was not made",
            error: dbErr
        }); 
    }
        
    dbn.remove({ _id: req.params.id}, {}, function (err, numRemoved) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured while deleting",
                error: err
            });    
        }    
        res.status(201).json({
            message: "Project was deleted",
            obj: numRemoved
        });
    });        
        
});

/// ANSWERS
router.post('/answer:id', function (req, res, next) {
  console.log('answer')    
  if (dbNotLoaded) {
      console.log('DB Error -- cannot patch')
      return res.status(500).json({
          title: "A database error occured -- your post was not made",
          error: dbErr
      }); 
  }
  
  var answer = {
    domainId: req.body.domainId,
    sequence: req.body.sequence,
    value: req.body.value,
    riskValue: req.body.riskValue,
    rationale: req.body.rationale,
    dateCreated: req.body.dateCreated,
    dateModified: req.body.dateCreated
  }
  
  dbn.update({ _id: req.params.id }, { $push: { answers: answer } }, {}, function (err, numReplaced) {
      console.log('numReplaced')
      console.log(numReplaced)
      if (err) {
          console.log(err)
          return res.status(500).json({
              title: "An error occured while updating this project",
              error: err
          });    
      }    
      res.status(201).json({
          message: "Project answer was added",
          obj: numReplaced
      });              
  });
  
});


router.patch('/answer:id', function (req, res, next) {
  if (dbNotLoaded) {
      console.log('DB Error -- cannot patch')
      return res.status(500).json({
          title: "A database error occured -- your post was not made",
          error: dbErr
      }); 
  }
  
  var index = '';
  dbn.findOne({ _id: req.params.id }, function (err, project) {
 
      var index = null;
       for (var i = 0; i < project.answers.length; i++) {
          if (project.answers[i].domainId == req.body.domainId 
              && project.answers[i].sequence == req.body.sequence) {
              dbn.update({_id: req.params.id }, { $set:{ 
                           'project.answers[i].value': req.body.value,
                           'project.answers[i].riskValue': req.body.riskValue,
                           'project.answers[i].rationale': req.body.rationale,
                           'project.answers[i].dateModified': req.body.dateModified
                         } }, {}, function (err, numReplaced) { 
                  console.log('numReplaced')
                  console.log(numReplaced)
                  if (err) {
                      console.log(err)
                      return res.status(500).json({
                          title: "An error occured while updating this project",
                          error: err
                      });    
                  }    
                  res.status(201).json({
                      message: "Project answer was added",
                      obj: numReplaced
                  });              
              });
              break;
           }  // update
       }   // for
  }); // findOne
  
});


//   console.log(index);
//   return;
  
//   var value = 'answers.' + index + '.value';
//   var riskValue = 'answers.' + index + '.riskValue';
//   var rationale = 'answers.' + index + '.rationale';
//   var dateModified = 'answers.' + index + '.dateModified';
 
//   dbn.update({_id: req.params.id }, { $set:{ value: req.body.value,
//                           riskValue: req.body.riskValue,
//                           rationale: req.body.rationale,
//                           dateModified: req.body.dateModified
//              } }, {}, function (err, numReplaced) { 
//       console.log('numReplaced')
//       console.log(numReplaced)
//       if (err) {
//           console.log(err)
//           return res.status(500).json({
//               title: "An error occured while updating this project",
//               error: err
//           });    
//       }    
//       res.status(201).json({
//           message: "Project answer was added",
//           obj: numReplaced
//       });              
//   });
  





module.exports = router;
