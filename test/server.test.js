const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server'); // Import your Express application

chai.use(chaiHttp);
const expect = chai.expect;

describe('Server Routes and Middleware', () => {
    it('should respond to GET /', (done) => {
        chai
            .request(app)
            .get('/')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.text).to.equal('Mainpage!');
                done();
            });
    });
});
