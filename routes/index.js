module.exports = (express,uuidv4) => {
  var router = express.Router();
  var request = require('request');

  router.get("/", (req, res) => {
    res.render("index");
  });

  router.get('/generate', (req, res) => {
      res.redirect("/"+uuidv4())
  });

  router.get('^/:uuid([-a-zA-Z0-9]{36})', (req, res) => {
    res.render("map", {uuid: req.params.uuid})
  });

  return router;
}
