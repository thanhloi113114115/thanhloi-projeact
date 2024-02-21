const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

passport.use(
	new GoogleStrategy(
		{
			clientID: '88131683455-ggeg7vhkiquergbfunda5koh7c361q17.apps.googleusercontent.com',
			clientSecret: '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',
			callbackURL: "/api/google/callback",
			scope: ["profile", "email"],
		},
		function (accessToken, refreshToken, profile, callback) {
			callback(null, profile);
		}
	)
);

passport.serializeUser(async (user, done) => {
	done(null, user);
});

passport.deserializeUser(async (user, done) => {
	done(null, user);
});
