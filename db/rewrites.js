exports.rewrites = [
	{
		"from":		"",
		"to":		"frontend/index.html"
	},
	{
		"from":		"css/*",
		"to":		"frontend/css/*"
	},
	{
		"from":		"img/*",
		"to":		"frontend/img/*"
	},
	{
		"from":		"js/*",
		"to":		"frontend/js/*"
	},

	{
		"from":		"favicon.ico",
		"to":		"frontend/img/favicon.ico"
	},
	{
		"from":		"font/*",
		"to":		"frontend/font/*"
	},
	/* tech stuff...*/
	{
		"from":		"google7f311b514ca2b68b.html",
		"to":		"frontend/google7f311b514ca2b68b.html"
	},
	{
		"from":		"robots.txt",
		"to":		"frontend/robots.txt"
	},
	/* keeping relative urls sane */
	{
		"from":		"/*",
		"to":		"/*"
	}
];
