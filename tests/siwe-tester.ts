import { Command } from 'commander';
import { Wallet } from 'ethers';
import { SiweMessage } from 'siwe';

const program = new Command();
program
  .name('siwe-tester')
  .description(
    'CLI tool for testing Sign-In-With-Ethereum (SIWE) authentication flow',
  )
  .version('0.0.1');

program
  .command('generate')
  .option('-n, --nonce <string>', 'nonce value')
  .action((options) => {
    const { nonce } = options;
    const wallet = Wallet.createRandom();
    const domain = 'localhost';
    const url = 'http://localhost:8080';
    const siweMessage = new SiweMessage({
      domain,
      address: wallet.address,
      statement: 'This is a test',
      uri: url,
      version: '1',
      chainId: 1,
      nonce,
    });

    const message = siweMessage.prepareMessage();
    const signature = wallet.signMessageSync(message);

    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        publicAddress: wallet.address,
        message,
        signature,
      }),
    );
  });

program.parse();
