
import { guid } from 'src/helpers/guid';


describe('guid', () => {

    it('should generate uid', () => {

        // test
        let uid1 = guid();
        let uid2 = guid();

        uid1.should.match(/^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/);
        uid1.should.not.be.equal(uid2);

    });

});