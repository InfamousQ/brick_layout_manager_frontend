class JWTTokenValidationError extends Error {
	constructor(message) {
		super(message);
		this.name = 'JWTTokenValidationError';
	}

}

class UnauthorizedError extends Error {
	constructor(message) {
		super(message);
		this.name = 'UnauthorizedError';
	}
}