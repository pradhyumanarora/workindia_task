const {Router} = require('express');
const router = Router();
const controller = require('../controllers')

router.post('/admin/signup', controller.signUp);
router.post('/admin/login', controller.logIn);
router.post('/addTeams',controller.addTeams);
router.post('/matches',controller.createMatch);
router.get('/matches',controller.getMatches);
router.get('/matches/:id',controller.getMatchById);
router.post('/teams/:team_id/sqaud',controller.createSquad);
router.post('/players/addStats', controller.addPlayerStats);
router.get('/players/:id/stats', controller.playerStats);


module.exports = router;