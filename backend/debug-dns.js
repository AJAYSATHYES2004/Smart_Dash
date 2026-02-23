const dns = require('dns');
const fs = require('fs');

try {
    dns.setServers(['8.8.8.8']);
} catch (e) {
    console.log('Set DNS Failed');
}

let output = '';

dns.resolveSrv('_mongodb._tcp.cluster0.lrjaeta.mongodb.net', (err, addresses) => {
    if (err) {
        output += `SRV Error: ${err.code}\n`;
        finish();
    } else {
        addresses.forEach(a => output += `SRV: ${a.name}:${a.port}\n`);

        // Also try to get TXT record for options (replicaSet name etc)
        dns.resolveTxt('cluster0.lrjaeta.mongodb.net', (err, records) => {
            if (!err) {
                output += `TXT: ${JSON.stringify(records)}\n`;
            }
            finish();
        });
    }
});

function finish() {
    fs.writeFileSync('dns-result.txt', output);
    console.log('Done writing to dns-result.txt');
}
