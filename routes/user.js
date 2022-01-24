var express = require('express'),
  router = express.Router(),
  passport = require('passport'),
  ObjectId = require('mongoose').Types.ObjectId,
  User = require('../schemas/User');

router.get('/register', function (req, res, next) {
  res.render('register');
});

router.post('/register', async function (req, res, next) {
  var errors = [];
  if(req.body.password.length < 8) errors.push('Password must be at least 8 characters'); // Password handled here, not in Schema

  var user = new User({ email: req.body.email, username: req.body.username })

  var validation = await user.validateSync();
  if(validation) {
    for (field in validation.errors) {
      errors.push(validation.errors[field].message)
    }
  }

  // We can use this line to save resources if needed : Postpone database query
  // if(errors.length) return res.json({ errors: errors });

  var alreadyInUse = await User.findOne({$or: [{ email: req.body.email }, { username: req.body.username }]});
  if(alreadyInUse) {
    if(alreadyInUse.email == req.body.email) errors.push('That email is already taken');
    if(alreadyInUse.username == req.body.username) errors.push('That username is already taken');
  }

  if(errors.length) return res.json({ errors: errors });

  User.register(
    user, req.body.password,
    function (err, user) {
      if (err) {
        /*
        console.log('Error Type:', typeof err);
        console.log('Error Name:', err.name);
        Object.getOwnPropertyNames(err).forEach(function (key) {
          console.log('Key:', key);
          console.log('Value:', err[key]);
        });
        */
        // There was an unspecified error caught
        return res.json({ errors: ['Uncaught Error : Contact a system administrator'] });
        // May Expose Data : return res.json({ errors: [err.message] })
      }

      passport.authenticate('local', function (err, user, info) { 
       if(err) return res.json({ errors: [err.message] });
       if(!user) return res.json({ errors: ['Incorrect username or password'] })
       req.login(user, function(err){ 
         if(err) return res.json({ errors: [err.message] }); 
         return res.json({ success:true });
       })
      })(req, res);
    }
  );
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', function(req, res) {
  passport.authenticate('local', function (err, user, info) { 
   if(err) return res.json({ errors: [err.message] });
   if(!user) return res.json({ errors: ['Incorrect username or password'] })
   req.login(user, function(err){ 
     if(err) return res.json({ errors: [err.message] }); 
     return res.json({ success:true });
   })
  })(req, res); 
});

router.get('/', async function (req, res, next) {
  if (!req.user) return res.redirect('/user/login?msg=NotLoggedIn');
  //var user = await User.findById(req.user._id);
  return res.json(req.user);
});

router.get('/:id', async function (req, res, next) {
  var target = req.params.id;
  if (!ObjectId.isValid(target)) return res.redirect('/user/login?error=InvalidID'); // Specified an Invalid ID

  var user = await User.findById(target);
  if (!user) return res.redirect('/user/login?error=TargetNotFound'); // No user with specified ID

  return res.json(user);
});

module.exports = router;