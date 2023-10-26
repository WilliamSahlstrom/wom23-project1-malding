const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server'); 
const { verifyToken } = require('../middleware/auth'); 

chai.use(chaiHttp);
const expect = chai.expect;

describe('Auth Middleware', () => {
    it('should pass with a valid token', (done) => {
        const token = 'valid_jwt_token_here'; // Replace with a valid JWT token
        const req = {
            headers: {
                authorization: `Bearer ${token}`
            }
        };

        const res = {};
        const next = () => {
            // Check if the request object now has the authUser property
            expect(req.authUser).to.be.an('object');
            done();
        };

        verifyToken(req, res, next);
    });

    it('should reject with an invalid token', (done) => {
        const token = 'invalid_token'; // Replace with an invalid token
        const req = {
            headers: {
                authorization: `Bearer ${token}`
            }
        };

        const res = {
            status: (statusCode) => {
                expect(statusCode).to.equal(401);
                return {
                    json: (data) => {
                        // Check if the response contains an error message
                        expect(data).to.have.property('message');
                        done();
                    }
                };
            }
        };

        const next = () => {
            done(new Error('The middleware should not call next with an invalid token.'));
        };

        verifyToken(req, res, next);
    });
});
