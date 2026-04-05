/**
 * Main routes configuration
 */

module.exports = (app) => {
  app.use('/api/auth', require('./auth.routes'));
  app.use('/api/rooms', require('./rooms.routes'));
  app.use('/api/games', require('./games.routes'));
  app.use('/api/leaderboard', require('./leaderboard.routes'));
  app.use('/api/profile', require('./profile.routes'));
};