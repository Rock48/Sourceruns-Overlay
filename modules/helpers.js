/**
 * Runs the `debug` callback if the NODE_ENV is set to debug/dev/development, otherwise runs `production`
 * Will silently fail if parameters are missing but does not check type.
 * This is case insensitive.
 * @param {function} debug 
 * @param {function} production
 */
function ifDebug(debug=()=>{}, production=()=>{}) {
	const NODE_ENV = process.env.NODE_ENV;
	if(/^(debug|dev(elopment)?)$/ig.test(NODE_ENV)) {
		return debug();
	} else if(NODE_ENV == "production") {
		return production();
	}

	throw new Error(`NODE_ENV="${NODE_ENV}". May only be "DEBUG" "DEV" "DEVELOPMENT" (aliases of "DEBUG") or "PRODUCTION" (case insensitive)`)
}

module.exports.ifDebug = ifDebug;