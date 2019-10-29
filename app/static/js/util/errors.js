class JWTTokenValidationError extends Error {
	constructor(message) {
		super(message);
		this.name = 'JWTTokenValidationError';
	}

}