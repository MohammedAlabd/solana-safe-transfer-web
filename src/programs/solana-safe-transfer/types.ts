/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_safe_transfer.json`.
 */
export type SolanaSafeTransfer = {
  address: '3zExAojjXHa545RTzs27AGgypcEF5xPhVAs4MA5PBbEB';
  metadata: {
    name: 'solanaSafeTransfer';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'initialize';
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: 'signer';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
        },
        {
          name: 'confirmationAccount';
          writable: true;
        },
      ];
      args: [];
    },
    {
      name: 'transferSol';
      discriminator: [78, 10, 236, 247, 109, 117, 21, 76];
      accounts: [
        {
          name: 'from';
          writable: true;
          signer: true;
        },
        {
          name: 'to';
          writable: true;
        },
        {
          name: 'systemProgram';
        },
        {
          name: 'confirmationAccount';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'confirmactionCode';
          type: 'string';
        },
      ];
    },
    {
      name: 'transferSpl';
      discriminator: [39, 188, 128, 58, 110, 48, 44, 182];
      accounts: [
        {
          name: 'tokenProgram';
        },
        {
          name: 'systemProgram';
        },
        {
          name: 'associatedTokenProgram';
        },
        {
          name: 'mint';
        },
        {
          name: 'fromTokenAccount';
          writable: true;
        },
        {
          name: 'fromAuthority';
          signer: true;
        },
        {
          name: 'toTokenAccount';
          writable: true;
        },
        {
          name: 'toAuthority';
        },
        {
          name: 'confirmationAccount';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'confirmactionCode';
          type: 'string';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'confirmationAccount';
      discriminator: [216, 45, 251, 135, 250, 128, 11, 247];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'invalidConfirmationCode';
      msg: 'The confirmation code is invalid';
    },
  ];
  types: [
    {
      name: 'confirmationAccount';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'code';
            type: 'string';
          },
        ];
      };
    },
  ];
};
