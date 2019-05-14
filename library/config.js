module.exports = {
    apiDbConn: process.env.apiDbConn ? JSON.parse(process.env.apiDbConn) : {
        server: 'blockblox.database.windows.net',
        userName: 'apiuser',
        password: 'mayur4all!',
        options: { encrypt: true, database: 'bec-db-dev' }
    },
    prodDbConn: {
        server: 'blockblox.database.windows.net',
        userName: 'apiuser',
        password: 'mayur4all!',
        options: { encrypt: true, database: 'bec-db' }
    },
    civicApi: process.env.civicApi || {
        // App details for production Civic development app - daniel@blockblox.io
        appId: 'ih9h18V7P',
        prvKey: 'cafdbceda5678406f5877c71d9dd1eff8f3d3ad7261f25b6801b8ca79859acdf',
        appSecret: 'e5226977ca7bd0062edb186d96a293ec'
        // App details for localhost - daniel@blockblox.io
        // appId: 'tBjrFcA-v',
        // prvKey: 'bd6580d6b830f5d660a0bcdfbe00c72ce7744a90fa4c6e1b9701f24dc46dbb39',
        // appSecret: '29331481e752a6b85415a022180b3ae8'
    },
    docusignApi: process.env.docusignApi ? JSON.parse(process.env.docusignApi) : {
        // The Docusign JWT test in tests/scripts/UnitTest.js will give the approval URL necessary if anything is changed
        integratorKey: '5d48c110-427a-4148-ad37-9579bfa5f371',
        oAuthBasePath: 'account-d.docusign.com',
        privateKey: './library/docusign-devkey.txt',
        redirectURI: 'https://www.docusign.com/api',
        sellerEmail: 'mark@blockblox.io',
        sellerName: 'Seller Mark',
        templateId: '52c61651-3ab4-40f9-83d8-5a08bf41f6c8',
        userId: '2274ebf8-59bc-494e-9c50-9911b0ed7ab2'
        // The following are the PRODUCTION values -- DO NOT USE FOR DEVELOPMENT/DEBUGGING
        //"integratorKey": "54344bd9-9625-45c0-a720-d6a2ec6180fb",
        //"oAuthBasePath": "account.docusign.com",
        //"privateKey": "./library/docusign-prodkey.txt",
        //"redirectURI": "https://www.docusign.com/api",
        //"sellerEmail": "marco.aniballi@bec.ltd",
        //"sellerName": "Marco Aniballi",
        //"templateId": "1b58c859-7fce-4202-9907-334b2b11e925",
        //"userId": "32608263-d16f-4dfc-a6b0-cda8aebd1b1c"
    },
    reactEnv: process.env.reactEnv || 'dev',
    sendgridApi: process.env.sendgridApi || {
        password: 'sendgrid0',
        privateKey: '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',
        userName: 'azure_501819d175bdbd62e41a0e85cec0e358@azure.com'
    },
    tokenSig: process.env.tokenSig || 'the tomatoes are in the attic',
    twiseApi: process.env.twiseApi || {
        key: 'd0f06873-151e-4488-a367-664acb8ca1e2',
        baseURL: 'https://api.sandbox.transferwise.tech/v1'
    }
};
