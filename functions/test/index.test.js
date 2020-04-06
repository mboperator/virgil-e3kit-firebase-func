const assert = require('assert');
const { expect } = require('chai');
const { initCrypto, VirgilCrypto, VirgilCardCrypto } = require('virgil-crypto');
const { VirgilCardVerifier, CardManager, CallbackJwtProvider } = require('virgil-sdk');
const config = require('./test.config');
const myFunctions = require('../lib/index.js');

const test = require('firebase-functions-test')({
    databaseURL: config.databaseURL,
    storageBucket: config.storageBucket,
    projectId: config.projectId,
}, 'virgil-demo-10380-8d7e72b52304.json');

test.mockConfig({virgil: config.virgil});

describe('Cloud Functions', async () => {
    
    it('Test firebase function for authorized user', async () => {
        const req = { auth: {token: { uid: 'alice@example.com'}} };
        
        const getVirgilJwtWrapped = test.wrap(myFunctions.getVirgilJwt);
        var res = await getVirgilJwtWrapped([], req);
        token = res.token;
        assert.equal(res.hasOwnProperty('token'), true);

        await initCrypto();
        const cardCrypto = new VirgilCardCrypto(new VirgilCrypto());
        const cardVerifier = new VirgilCardVerifier(cardCrypto);    
        const cardManager = new CardManager({
            cardCrypto: cardCrypto,
            cardVerifier: cardVerifier,
            accessTokenProvider: new CallbackJwtProvider(() => token)
        });
        const result = await cardManager.searchCards('alice@example.com');
        assert.ok(result);
    });

    it('Test firebase function for unauthorized user', async () => {
        const req = { auth: {token: { uid: ''}} };

        const getVirgilJwtWrapped = test.wrap(myFunctions.getVirgilJwt);
        try {
            expect ( await getVirgilJwtWrapped([], req) ).to.be.an.instanceof ( TypeError );
        } catch ( err ) {
            expect ( err ).to.be.an.instanceof ( TypeError );
        }
    });
});
